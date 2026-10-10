// Provider-native JSON transport. Callers own full schema and semantic validation.
export function leanWireSchema(value) {
    if (Array.isArray(value)) return value.map(leanWireSchema)
    if (!value || typeof value !== 'object') return value
    const result = {}
    for (const [key, child] of Object.entries(value)) {
        if (['additionalProperties', 'minItems', 'maxItems', 'minimum', 'maximum', 'const'].includes(key)) continue
        result[key] = leanWireSchema(child)
    }
    if (value.const !== undefined) result.enum = [value.const]
    return result
}
export async function nativeComplete({
    apiKey,
    model,
    messages,
    schema,
    name = 'canvas_plan',
    maxTokens = 8192,
    timeoutMs = 55000,
    transport = fetch
}) {
    const started = Date.now()
    if (!apiKey) return { ok: false, code: 'model_credential_unavailable', elapsed_ms: 0 }
    try {
        const request = {
            model,
            temperature: model.startsWith('google/') ? 1 : 0.1,
            max_tokens: maxTokens,
            ...(model.startsWith('google/') ? { reasoning: { effort: 'low' } } : {}),
            response_format: {
                type: 'json_schema',
                json_schema: { name, strict: true, schema: model.startsWith('google/') ? leanWireSchema(schema) : schema }
            },
            messages
        }
        const response = await transport('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'X-Title': 'Tutor Today Canvas planner v2' },
            body: JSON.stringify(request),
            timeout: timeoutMs,
            size: 300000,
            redirect: 'error',
            ...(typeof AbortSignal !== 'undefined' ? { signal: AbortSignal.timeout(timeoutMs) } : {})
        })
        const body = await response.json()
        if (!response.ok || body.error)
            return {
                ok: false,
                code: 'provider_http_' + response.status,
                elapsed_ms: Date.now() - started,
                providerCode: body.error?.code,
                diagnostic: String(body.error?.message || '')
                    .split(apiKey)
                    .join('[redacted]')
                    .slice(0, 500),
                providerDetail: String(body.error?.metadata?.raw || '')
                    .split(apiKey)
                    .join('[redacted]')
                    .slice(0, 1000)
            }
        const content = body.choices?.[0]?.message?.content
        let value
        try {
            value = JSON.parse(content)
        } catch {
            return {
                ok: false,
                code: 'provider_invalid_json',
                elapsed_ms: Date.now() - started,
                finishReason: body.choices?.[0]?.finish_reason
            }
        }
        const exact = body.model === model
        return {
            ok: exact,
            code: exact ? 'ok' : 'unexpected_model',
            value,
            elapsed_ms: Date.now() - started,
            requestedModel: model,
            servedModel: body.model,
            provider: body.provider,
            usage: body.usage,
            finishReason: body.choices?.[0]?.finish_reason
        }
    } catch {
        return { ok: false, code: 'provider_transport_or_deadline', elapsed_ms: Date.now() - started }
    }
}
export function flowiseOutputSchema(fields) {
    const properties = {}
    for (const field of fields) {
        let shape
        if (field.type === 'enum') shape = { type: 'string', enum: field.enumValues.split(',').map((v) => v.trim()) }
        else if (field.type === 'jsonArray') {
            const properties = JSON.parse(field.jsonSchema)
            shape = { type: 'array', items: { type: 'object', properties, required: Object.keys(properties), additionalProperties: false } }
        } else if (field.type === 'stringArray') shape = { type: 'array', items: { type: 'string' } }
        else shape = { type: field.type }
        properties[field.key] = { ...shape, description: field.description }
    }
    return { type: 'object', properties, required: Object.keys(properties), additionalProperties: false }
}
