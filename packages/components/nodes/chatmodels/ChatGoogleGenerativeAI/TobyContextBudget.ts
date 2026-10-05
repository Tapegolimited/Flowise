import type { GenerateContentRequest, GenerativeModel } from '@google/generative-ai'
import { performance } from 'node:perf_hooks'

export type TobyContextBudgetCode =
    | 'toby_context_budget_config_invalid'
    | 'toby_context_budget_exceeded'
    | 'toby_context_budget_unavailable'
    | 'toby_context_budget_timeout'
    | 'toby_context_budget_aborted'

/** Safe for Flowise's generic error handler: never include provider errors or learner content. */
export class TobyContextBudgetError extends Error {
    readonly code: TobyContextBudgetCode
    readonly retryable: boolean

    constructor(code: TobyContextBudgetCode) {
        super(code)
        this.name = 'TobyContextBudgetError'
        this.code = code
        this.retryable = code === 'toby_context_budget_unavailable' || code === 'toby_context_budget_timeout'
    }
}

export interface TobyContextBudgetConfig {
    contextWindowTokens: number
    marginTokens: number
    timeoutMs: number
}

function integer(value: unknown, minimum: number, maximum: number): number {
    if (typeof value === 'string' && /^(0|[1-9]\d*)$/.test(value)) value = Number(value)
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum || value > maximum) {
        throw new TobyContextBudgetError('toby_context_budget_config_invalid')
    }
    return value
}

/** Explicit opt-in only; OFF ignores all budget settings and preserves the existing model path. */
export function readTobyContextBudgetConfig(inputs: Record<string, unknown> = {}): TobyContextBudgetConfig | undefined {
    if (inputs.tobyContextBudgetEnabled !== true) return undefined
    const config = {
        contextWindowTokens: integer(inputs.tobyContextWindowTokens, 1, 1_000_000_000),
        marginTokens: integer(inputs.tobyContextBudgetMarginTokens ?? 2048, 0, 1_000_000_000),
        timeoutMs: integer(inputs.tobyContextBudgetTimeoutMs ?? 1500, 1, 3000)
    }
    if (config.marginTokens >= config.contextWindowTokens) throw new TobyContextBudgetError('toby_context_budget_config_invalid')
    // The existing node otherwise permissively parses this field; the guarded path must not coerce it.
    integer(inputs.maxOutputTokens, 1, 1_000_000_000)
    return config
}

const defaultFields = ['generationConfig', 'safetySettings', 'tools', 'toolConfig', 'systemInstruction', 'cachedContent'] as const

/** Mirror this SDK's final GenerateContentRequest, including defaults that are not on invocationParams. */
function snapshotRequest(client: GenerativeModel, request: GenerateContentRequest): GenerateContentRequest {
    const effective = {
        generationConfig: client.generationConfig,
        safetySettings: client.safetySettings,
        tools: client.tools,
        toolConfig: client.toolConfig,
        systemInstruction: client.systemInstruction,
        cachedContent: client.cachedContent?.name,
        ...request
    }
    let snapshot: GenerateContentRequest
    try {
        // This is wire serialization, NOT a token estimate. It also prevents subsequent history/tool mutation.
        snapshot = JSON.parse(JSON.stringify(effective))
    } catch {
        throw new TobyContextBudgetError('toby_context_budget_config_invalid')
    }
    // Explicit undefined overrides stop later SDK default mutation adding uncounted fields.
    for (const field of defaultFields) {
        if (!Object.prototype.hasOwnProperty.call(snapshot, field)) (snapshot as any)[field] = undefined
    }
    return snapshot
}

/**
 * Count the full native request for this exact model. Never trim, infer tokens from bytes,
 * retry the count, or issue generation if counting cannot establish the configured budget.
 */
export async function prepareTobyBudgetedRequest(
    client: GenerativeModel,
    request: GenerateContentRequest,
    config?: TobyContextBudgetConfig,
    signal?: AbortSignal
): Promise<GenerateContentRequest> {
    if (!config) return request
    const contextWindowTokens = integer(config.contextWindowTokens, 1, 1_000_000_000)
    const marginTokens = integer(config.marginTokens, 0, 1_000_000_000)
    const timeoutMs = integer(config.timeoutMs, 1, 3000)
    if (signal?.aborted) throw new TobyContextBudgetError('toby_context_budget_aborted')
    if (!client || typeof client.model !== 'string' || !client.model || typeof client.countTokens !== 'function') {
        throw new TobyContextBudgetError('toby_context_budget_config_invalid')
    }
    const snapshot = snapshotRequest(client, request)
    if (!Array.isArray(snapshot.contents) || !snapshot.contents.length) {
        throw new TobyContextBudgetError('toby_context_budget_config_invalid')
    }
    const outputTokens = integer(snapshot.generationConfig?.maxOutputTokens, 1, 1_000_000_000)
    if (outputTokens + marginTokens > contextWindowTokens) throw new TobyContextBudgetError('toby_context_budget_exceeded')

    const controller = new AbortController()
    const deadline = performance.now() + timeoutMs
    let timer: ReturnType<typeof setTimeout> | undefined
    let aborted: (() => void) | undefined
    const cancellation = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
            reject(new TobyContextBudgetError('toby_context_budget_timeout'))
            controller.abort()
        }, timeoutMs)
        aborted = () => {
            reject(new TobyContextBudgetError('toby_context_budget_aborted'))
            controller.abort()
        }
        signal?.addEventListener('abort', aborted, { once: true })
        if (signal?.aborted) aborted()
    })
    try {
        const counted = await Promise.race([
            // Full GenerateContentRequest includes system instruction, tools, history and expanded file content.
            client.countTokens({ generateContentRequest: snapshot }, { timeout: timeoutMs, signal: controller.signal }),
            cancellation
        ])
        if (signal?.aborted) throw new TobyContextBudgetError('toby_context_budget_aborted')
        if (performance.now() >= deadline) throw new TobyContextBudgetError('toby_context_budget_timeout')
        const totalTokens = counted?.totalTokens
        if (!Number.isSafeInteger(totalTokens) || totalTokens < 0) throw new TobyContextBudgetError('toby_context_budget_unavailable')
        if (totalTokens + outputTokens + marginTokens > contextWindowTokens)
            throw new TobyContextBudgetError('toby_context_budget_exceeded')
        return snapshot
    } catch (error) {
        if (error instanceof TobyContextBudgetError) throw error
        throw new TobyContextBudgetError('toby_context_budget_unavailable')
    } finally {
        if (timer !== undefined) clearTimeout(timer)
        if (aborted) signal?.removeEventListener('abort', aborted)
    }
}
