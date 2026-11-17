import { AsyncLocalStorage } from 'node:async_hooks'
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { BaseCallbackHandler } from '@langchain/core/callbacks/base'
import type { LLMResult } from '@langchain/core/outputs'

type Primitive = string | number | boolean
type Properties = Record<string, Primitive>
type Outcome = 'success' | 'error' | 'timeout' | 'rate_limited' | 'cancelled' | 'paused'
export type AiEvent = {
    distinct_id: string
    event: '$ai_trace' | '$ai_span' | '$ai_generation' | '$ai_embedding'
    properties: Properties
    uuid: string
    timestamp: string
}
export type AiParent = { traceId: string; spanId: string }
type AiRun = AiParent & { send: (event: AiEvent) => void; workflow: string; version: number; runs: Map<string, number> }

const context = new AsyncLocalStorage<AiRun>()
const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/
const modelName = /^[a-zA-Z0-9._:/+-]{1,128}$/
export const aiTraceHeader = 'x-tt-ai-trace'

export function signAiParent(parent: AiParent, secret: string, flowId: string): string {
    if (secret.length < 32 || !uuid.test(flowId)) return ''
    const payload = [parent.traceId, parent.spanId, Date.now()].join('.')
    return (
        payload +
        '.' +
        createHmac('sha256', secret)
            .update(payload + '.' + flowId)
            .digest('hex')
    )
}

export function readAiParent(header: string | undefined, secret: string, flowId: string): AiParent | undefined {
    if (!header || secret.length < 32 || header.length > 160 || !uuid.test(flowId)) return
    const parts = header.split('.')
    const [traceId, spanId, issued, mac] = parts
    if (parts.length !== 4 || !uuid.test(traceId) || !uuid.test(spanId) || !/^\d{13}$/.test(issued) || !/^[a-f0-9]{64}$/.test(mac)) return
    if (Math.abs(Date.now() - Number(issued)) > 300_000) return
    const expected = createHmac('sha256', secret)
        .update(parts.slice(0, 3).join('.') + '.' + flowId)
        .digest()
    if (timingSafeEqual(expected, Buffer.from(mac, 'hex'))) return { traceId, spanId }
}

export function aiChildHeaders(url: string, method: string | undefined): Record<string, string> | undefined {
    const state = context.getStore()
    const configuredOrigin = process.env.TT_POSTHOG_AI_FLOWISE_ORIGIN
    if (!state || method?.toUpperCase() !== 'POST' || !configuredOrigin || !url.startsWith(configuredOrigin + '/api/v1/prediction/')) return
    const flowId = url.slice(configuredOrigin.length + '/api/v1/prediction/'.length)
    const header = signAiParent(state, process.env.TT_POSTHOG_AI_TRACE_SECRET ?? '', flowId)
    if (header) return { [aiTraceHeader]: header }
}

function capture(state: AiRun, event: AiEvent['event'], started: number, outcome: Outcome, properties: Properties = {}) {
    try {
        const id = event === '$ai_trace' || event === '$ai_span' ? state.spanId : randomUUID()
        const envelope: AiEvent = {
            distinct_id: state.traceId,
            event,
            uuid: id,
            timestamp: new Date().toISOString(),
            properties: {
                $ai_trace_id: state.traceId,
                $ai_span_id: id,
                $ai_latency: Math.max(0, performance.now() - started) / 1000,
                $ai_is_error: outcome === 'error' || outcome === 'rate_limited' || outcome === 'timeout',
                $process_person_profile: false,
                $geoip_disable: true,
                tt_runtime: 'flowise',
                tt_workflow: state.workflow,
                tt_workflow_version: state.version,
                tt_outcome: outcome,
                ...properties
            }
        }
        if (envelope.properties.$ai_is_error) envelope.properties.$ai_error = outcome
        state.send(envelope)
    } catch {
        // Analytics has no effect on a prediction or callback.
    }
}

function outcomeFor(error: unknown, signal?: AbortSignal): Outcome {
    if (signal?.aborted) return 'cancelled'
    if (!error || typeof error !== 'object') return 'error'
    const failure = error as { status?: unknown; statusCode?: unknown; name?: unknown; code?: unknown }
    const status = failure.status ?? failure.statusCode ?? (error as { response?: { status?: number } }).response?.status
    if (status === 429) return 'rate_limited'
    if (status === 408 || status === 504 || failure.name === 'TimeoutError' || failure.code === 'ECONNABORTED') return 'timeout'
    if (failure.name === 'AbortError' || failure.code === 'ERR_CANCELED') return 'cancelled'
    return 'error'
}

export async function runWithAiTrace<T>(
    send: AiRun['send'],
    workflow: string,
    version: number,
    spanName: string,
    parent: AiParent | undefined,
    signal: AbortSignal | undefined,
    execute: () => Promise<T>,
    classify?: (result: T) => Outcome
): Promise<T> {
    const id = randomUUID()
    const state: AiRun = { traceId: parent?.traceId ?? id, spanId: id, send, workflow, version, runs: new Map() }
    const started = performance.now()
    const properties: Properties = { $ai_span_name: spanName }
    if (parent) properties.$ai_parent_id = parent.spanId
    return context.run(state, async () => {
        let outcome: Outcome = 'success'
        try {
            const result = await execute()
            if (signal?.aborted) outcome = 'cancelled'
            else if (classify) {
                try {
                    outcome = classify(result)
                } catch {
                    // A diagnostic classifier must not alter a successful result.
                }
            }
            return result
        } catch (error) {
            outcome = outcomeFor(error, signal)
            throw error
        } finally {
            capture(state, parent ? '$ai_span' : '$ai_trace', started, outcome, properties)
        }
    })
}

export async function observeAiOperation<T>(
    event: '$ai_generation' | '$ai_embedding',
    operation: string,
    provider: string,
    model: unknown,
    execute: () => Promise<T>,
    options: {
        signal?: AbortSignal
        classify?: (result: T) => Outcome
        usage?: (result: T) => { tokens?: Record<string, unknown>; characters?: number }
    } = {}
): Promise<T> {
    const state = context.getStore()
    if (!state) return execute()
    const properties: Properties = { $ai_parent_id: state.spanId, $ai_span_name: operation, $ai_provider: provider }
    if (typeof model === 'string' && modelName.test(model)) properties.$ai_model = model
    const started = performance.now()
    let outcome: Outcome = 'success'
    try {
        const result = await execute()
        try {
            if (options.signal?.aborted) outcome = 'cancelled'
            else if (options.classify) outcome = options.classify(result)
            const usage = options.usage?.(result)
            addAiUsage(properties, usage?.tokens)
            if (usage?.characters !== undefined && Number.isSafeInteger(usage.characters) && usage.characters >= 0) {
                properties.tt_input_characters = usage.characters
            }
        } catch {
            // Provider results must stay available if diagnostic classification fails.
        }
        return result
    } catch (error) {
        outcome = outcomeFor(error, options.signal)
        throw error
    } finally {
        capture(state, event, started, outcome, properties)
    }
}

export function addAiUsage(properties: Properties, usage: Record<string, unknown> | undefined) {
    if (!usage) return
    const input = usage.input_tokens ?? usage.prompt_tokens ?? usage.promptTokenCount
    const output = usage.output_tokens ?? usage.completion_tokens ?? usage.candidatesTokenCount
    if (typeof input === 'number' && Number.isSafeInteger(input) && input >= 0) properties.$ai_input_tokens = input
    if (typeof output === 'number' && Number.isSafeInteger(output) && output >= 0) properties.$ai_output_tokens = output
    if (typeof usage.cost === 'number' && Number.isFinite(usage.cost) && usage.cost >= 0) {
        properties.$ai_total_cost_usd = usage.cost
        properties.$ai_cost_passthrough = true
        properties.tt_cost_source = 'provider_reported'
    }
}

export function observeChatModel(model: { callbacks?: unknown }, provider: string, configuredModel: unknown) {
    const stateModel = typeof configuredModel === 'string' && modelName.test(configuredModel) ? configuredModel : undefined
    const propertiesFor = (state: AiRun): Properties => {
        const properties: Properties = { $ai_parent_id: state.spanId, $ai_span_name: 'model', $ai_provider: provider }
        if (stateModel) properties.$ai_model = stateModel
        return properties
    }
    const start = (_llm: unknown, _input: unknown, runId: string) => {
        const state = context.getStore()
        if (state && state.runs.size < 512) state.runs.set(runId, performance.now())
    }
    const finish = (runId: string, result?: LLMResult, error?: unknown) => {
        const state = context.getStore()
        const started = state?.runs.get(runId)
        if (!state || started === undefined) return
        state.runs.delete(runId)
        const properties = propertiesFor(state)
        try {
            if (result) {
                // Prefer the provider's usage metadata on the returned message. LangChain
                // may synthesize tokenUsage estimates when providers omit it.
                const generation = result.generations[0]?.[0] as
                    | { message?: { usage_metadata?: Record<string, unknown>; response_metadata?: Record<string, unknown> } }
                    | undefined
                const returnedModel = generation?.message?.response_metadata?.model_name ?? generation?.message?.response_metadata?.model
                if (typeof returnedModel === 'string' && modelName.test(returnedModel)) properties.$ai_model = returnedModel
                addAiUsage(properties, generation?.message?.usage_metadata)
            }
        } catch {
            // A provider's response metadata can be incomplete or malformed.
        }
        capture(state, '$ai_generation', started, result ? 'success' : outcomeFor(error), properties)
    }
    const callback = BaseCallbackHandler.fromMethods({
        handleLLMStart: start,
        handleChatModelStart: start,
        handleLLMEnd: (result, runId) => finish(runId, result),
        handleLLMError: (error, runId) => finish(runId, undefined, error)
    })
    // Model constructors in these nodes use callbacks arrays or no callbacks.
    // A CallbackManager supplied by another caller remains authoritative.
    if (model.callbacks === undefined) model.callbacks = [callback]
    else if (Array.isArray(model.callbacks)) model.callbacks = [...model.callbacks, callback]
}

const providerRoutes = new Map([
    ['https://openrouter.ai/api/alpha/decisions', 'openrouter'],
    ['https://openrouter.ai/api/v1/chat/completions', 'openrouter'],
    ['https://api.openai.com/v1/chat/completions', 'openai'],
    ['https://api.openai.com/v1/responses', 'openai'],
    ['https://api.openai.com/v1/embeddings', 'openai'],
    ['https://api.anthropic.com/v1/messages', 'anthropic']
])

function objectValue(value: unknown): Record<string, unknown> | undefined {
    if (typeof value === 'string' && value.length <= 256_000) {
        try {
            value = JSON.parse(value)
        } catch {
            return
        }
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
}

export async function observeAiHttp<T extends { data?: unknown }>(
    url: unknown,
    method: unknown,
    body: unknown,
    send: () => Promise<T>
): Promise<T> {
    const state = context.getStore()
    if (!state || typeof url !== 'string' || typeof method !== 'string' || method.toUpperCase() !== 'POST') return send()
    const provider = providerRoutes.get(url)
    if (!provider) return send()
    const event = url.endsWith('/embeddings') ? '$ai_embedding' : '$ai_generation'
    const properties: Properties = { $ai_parent_id: state.spanId, $ai_span_name: 'provider_request', $ai_provider: provider }
    const started = performance.now()
    try {
        const configured = objectValue(body)?.model
        if (typeof configured === 'string' && modelName.test(configured)) properties.$ai_model = configured
    } catch {
        // Some sandbox inputs are proxies. Only use readable scalar metadata.
    }
    let result: T
    try {
        result = await send()
    } catch (error) {
        capture(state, event, started, outcomeFor(error), properties)
        throw error
    }
    try {
        const response = objectValue(result.data)
        const model = response?.model
        if (typeof model === 'string' && modelName.test(model)) properties.$ai_model = model
        addAiUsage(properties, objectValue(response?.usage))
        const status = (result as { status?: unknown }).status
        const outcome = typeof status === 'number' && status >= 400 ? outcomeFor({ status }) : 'success'
        if (typeof status === 'number' && Number.isInteger(status)) properties.$ai_http_status = status
        capture(state, event, started, outcome, properties)
    } catch {
        // The HTTP result must reach the workflow even if extraction fails.
    }
    return result
}

// The private Jev graph consumes the existing response through text() in the VM.
// Record usage when that read completes, preserving the original stream and limits.
export async function observeJevFetch<T extends { status: number; text: () => Promise<string> }>(
    url: string,
    options: { method?: string; body?: unknown },
    send: () => Promise<T>
): Promise<T> {
    const state = context.getStore()
    if (!state || url !== 'https://openrouter.ai/api/alpha/decisions' || options.method?.toUpperCase() !== 'POST') return send()

    const started = performance.now()
    const properties: Properties = {
        $ai_parent_id: state.spanId,
        $ai_span_name: 'provider_request',
        $ai_provider: 'openrouter'
    }
    try {
        const model = objectValue(options.body)?.model
        if (typeof model === 'string' && modelName.test(model)) properties.$ai_model = model
    } catch {
        // A body field can be unavailable across the VM boundary.
    }
    let response: T
    try {
        response = await send()
    } catch (error) {
        capture(state, '$ai_generation', started, outcomeFor(error), properties)
        throw error
    }
    properties.$ai_http_status = response.status
    if (response.status < 200 || response.status >= 300) {
        capture(state, '$ai_generation', started, outcomeFor({ status: response.status }), properties)
        return response
    }
    const read = response.text.bind(response)
    let captured = false
    response.text = async () => {
        try {
            const text = await read()
            if (!captured) {
                captured = true
                addAiUsage(properties, objectValue(objectValue(text)?.usage))
                capture(state, '$ai_generation', started, 'success', properties)
            }
            return text
        } catch (error) {
            if (!captured) {
                captured = true
                capture(state, '$ai_generation', started, outcomeFor(error), properties)
            }
            throw error
        }
    }
    return response
}
