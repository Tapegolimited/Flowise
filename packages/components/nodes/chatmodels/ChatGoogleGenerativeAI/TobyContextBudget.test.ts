import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GenerateContentRequest, GenerativeModel } from '@google/generative-ai'
import {
    prepareTobyBudgetedRequest,
    readTobyContextBudgetConfig,
    TobyContextBudgetConfig,
    TobyContextBudgetError
} from './TobyContextBudget'

const config: TobyContextBudgetConfig = { contextWindowTokens: 1000, marginTokens: 100, timeoutMs: 100 }
const request = (): GenerateContentRequest => ({ contents: [{ role: 'user', parts: [{ text: 'Synthetic worksheet review.' }] }] })
const client = (totalTokens = 700): GenerativeModel =>
    ({
        model: 'models/gemini-synthetic-test',
        generationConfig: { maxOutputTokens: 200 },
        systemInstruction: { role: 'system', parts: [{ text: 'Synthetic tutoring instruction.' }] },
        tools: [{ functionDeclarations: [{ name: 'synthetic_tool', description: 'Read-only synthetic tool.' }] }],
        toolConfig: {},
        safetySettings: [],
        countTokens: jest.fn().mockResolvedValue({ totalTokens })
    } as unknown as GenerativeModel)

describe('native request budget configuration', () => {
    it.each([undefined, false, 'true', 1])('is opt-in only (%s)', (enabled) => {
        expect(readTobyContextBudgetConfig({ tobyContextBudgetEnabled: enabled, tobyContextWindowTokens: 'invalid' })).toBeUndefined()
    })
    it('accepts strict operator values without modifying ordinary model settings', () => {
        expect(
            readTobyContextBudgetConfig({ tobyContextBudgetEnabled: true, tobyContextWindowTokens: '10000', maxOutputTokens: '200' })
        ).toEqual({ contextWindowTokens: 10000, marginTokens: 2048, timeoutMs: 1500 })
    })
    it.each(['100x', '1e4', '1.5', -1, NaN, null, undefined, Number.MAX_SAFE_INTEGER])('rejects invalid limits (%s)', (value) => {
        expect(() =>
            readTobyContextBudgetConfig({ tobyContextBudgetEnabled: true, tobyContextWindowTokens: value, maxOutputTokens: 200 })
        ).toThrow('toby_context_budget_config_invalid')
    })
    it.each(['200x', '', 0, -1, 2.5, undefined])('rejects a coerced or missing output reserve (%s)', (value) => {
        expect(() =>
            readTobyContextBudgetConfig({ tobyContextBudgetEnabled: true, tobyContextWindowTokens: 10000, maxOutputTokens: value })
        ).toThrow('toby_context_budget_config_invalid')
    })
    it('rejects an unbounded timeout and a margin leaving no context', () => {
        expect(() =>
            readTobyContextBudgetConfig({
                tobyContextBudgetEnabled: true,
                tobyContextWindowTokens: 10000,
                maxOutputTokens: 200,
                tobyContextBudgetTimeoutMs: 3001
            })
        ).toThrow(TobyContextBudgetError)
        expect(() =>
            readTobyContextBudgetConfig({
                tobyContextBudgetEnabled: true,
                tobyContextWindowTokens: 10000,
                maxOutputTokens: 200,
                tobyContextBudgetMarginTokens: 10000
            })
        ).toThrow(TobyContextBudgetError)
    })
})

describe('complete final provider request', () => {
    it('does nothing when disabled, including no count and identical request identity', async () => {
        const input = request()
        expect(await prepareTobyBudgetedRequest(undefined as any, input)).toBe(input)
    })
    it('allows the exact limit and includes system/tools/output reserve', async () => {
        const model = client()
        const prepared = await prepareTobyBudgetedRequest(model, request(), config)
        expect(prepared.generationConfig?.maxOutputTokens).toBe(200)
        expect(prepared.systemInstruction).toEqual(model.systemInstruction)
        expect(prepared.tools).toEqual(model.tools)
        expect(model.countTokens).toHaveBeenCalledTimes(1)
        expect((model.countTokens as jest.Mock).mock.calls[0][0].generateContentRequest).toBe(prepared)
    })
    it('counts history, expanded PDF text, inline images and tool-result scratchpad together', async () => {
        const model = client(10)
        const input: GenerateContentRequest = {
            contents: [
                { role: 'user', parts: [{ text: 'Synthetic older history.' }] },
                { role: 'model', parts: [{ functionCall: { name: 'synthetic_tool', args: { field: 'synthetic' } } }] },
                { role: 'function', parts: [{ functionResponse: { name: 'synthetic_tool', response: { result: 'Synthetic result.' } } }] },
                {
                    role: 'user',
                    parts: [{ text: 'Synthetic complete PDF extraction.' }, { inlineData: { mimeType: 'image/png', data: 'c3ludGhldGlj' } }]
                }
            ]
        }
        expect((await prepareTobyBudgetedRequest(model, input, config)).contents).toEqual(input.contents)
    })
    it('reserves actual overridden output tokens, not stale client settings', async () => {
        await expect(
            prepareTobyBudgetedRequest(client(700), { ...request(), generationConfig: { maxOutputTokens: 201 } }, config)
        ).rejects.toMatchObject({ code: 'toby_context_budget_exceeded', retryable: false })
    })
    it('rejects one token over budget before generation', async () => {
        await expect(prepareTobyBudgetedRequest(client(701), request(), config)).rejects.toThrow('toby_context_budget_exceeded')
    })
    it.each([-1, 1.2, '7', NaN, undefined])('never substitutes estimates for invalid native counts (%s)', async (totalTokens) => {
        const model = client()
        ;(model.countTokens as jest.Mock).mockResolvedValue({ totalTokens })
        await expect(prepareTobyBudgetedRequest(model, request(), config)).rejects.toThrow('toby_context_budget_unavailable')
    })
    it('redacts provider errors and does not retry', async () => {
        const model = client()
        ;(model.countTokens as jest.Mock).mockRejectedValue(new Error('secret key, private URL, learner prompt'))
        await expect(prepareTobyBudgetedRequest(model, request(), config)).rejects.toMatchObject({
            message: 'toby_context_budget_unavailable',
            retryable: true
        })
        expect(model.countTokens).toHaveBeenCalledTimes(1)
    })
    it('times out even when a count transport ignores abort and never completes', async () => {
        const model = client()
        ;(model.countTokens as jest.Mock).mockImplementation(() => new Promise(() => {}))
        await expect(prepareTobyBudgetedRequest(model, request(), { ...config, timeoutMs: 10 })).rejects.toMatchObject({
            code: 'toby_context_budget_timeout',
            retryable: true
        })
        expect((model.countTokens as jest.Mock).mock.calls[0][1].signal.aborted).toBe(true)
    })
    it('blocks a late count response after timeout rather than returning an accepted request', async () => {
        const model = client()
        ;(model.countTokens as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve({ totalTokens: 1 }), 30))
        )
        await expect(prepareTobyBudgetedRequest(model, request(), { ...config, timeoutMs: 5 })).rejects.toThrow(
            'toby_context_budget_timeout'
        )
    })
    it('honours current cancellation with a typed safe error', async () => {
        const controller = new AbortController()
        const model = client()
        ;(model.countTokens as jest.Mock).mockImplementation(() => new Promise(() => {}))
        const promise = prepareTobyBudgetedRequest(model, request(), config, controller.signal)
        controller.abort()
        await expect(promise).rejects.toThrow('toby_context_budget_aborted')
    })
    it('does not contact provider for already-cancelled requests', async () => {
        const controller = new AbortController()
        controller.abort()
        const model = client()
        await expect(prepareTobyBudgetedRequest(model, request(), config, controller.signal)).rejects.toThrow('toby_context_budget_aborted')
        expect(model.countTokens).not.toHaveBeenCalled()
    })
    it('enforces elapsed deadline even if a synchronous provider blocks timer execution', async () => {
        const model = client()
        ;(model.countTokens as jest.Mock).mockImplementation(async () => {
            const end = Date.now() + 15
            while (Date.now() < end) {
                /* Simulated delayed event loop, not a real provider request. */
            }
            return { totalTokens: 1 }
        })
        await expect(prepareTobyBudgetedRequest(model, request(), { ...config, timeoutMs: 5 })).rejects.toThrow(
            'toby_context_budget_timeout'
        )
    })
    it('rejects a missing output reserve or malformed contents before any tokenization', async () => {
        const model = client()
        delete model.generationConfig.maxOutputTokens
        await expect(prepareTobyBudgetedRequest(model, request(), config)).rejects.toThrow('toby_context_budget_config_invalid')
        await expect(prepareTobyBudgetedRequest(client(), { contents: [] }, config)).rejects.toThrow('toby_context_budget_config_invalid')
        expect(model.countTokens).not.toHaveBeenCalled()
    })
    it('freezes counted contents/defaults while the count is in flight', async () => {
        const model = client(1)
        const input = request()
        ;(model.countTokens as jest.Mock).mockImplementation(async () => {
            input.contents[0].parts[0] = { text: 'Changed after counting.' }
            model.generationConfig.maxOutputTokens = 800
            model.systemInstruction = { role: 'system', parts: [{ text: 'Changed system.' }] }
            return { totalTokens: 1 }
        })
        const prepared = await prepareTobyBudgetedRequest(model, input, config)
        expect(prepared.contents[0].parts[0]).toEqual({ text: 'Synthetic worksheet review.' })
        expect(prepared.generationConfig?.maxOutputTokens).toBe(200)
        expect(prepared.systemInstruction).not.toEqual(model.systemInstruction)
    })
    it('retains explicit undefined default overrides so new SDK defaults cannot add uncounted data', async () => {
        const model = client(1)
        model.systemInstruction = undefined
        const prepared = await prepareTobyBudgetedRequest(model, request(), config)
        expect(Object.prototype.hasOwnProperty.call(prepared, 'systemInstruction')).toBe(true)
        expect(prepared.systemInstruction).toBeUndefined()
    })
})

describe('real SDK wire-contract proof (mocked local HTTP; no remote call)', () => {
    const originalFetch = global.fetch
    afterEach(() => {
        global.fetch = originalFetch
    })
    it('counts exactly the JSON later sent to native generation, including cached content and defaults', async () => {
        const bodies: { url: string; body: any }[] = []
        global.fetch = jest.fn(async (url: any, init: any) => {
            bodies.push({ url: String(url), body: JSON.parse(init.body) })
            return new Response(
                JSON.stringify(
                    String(url).includes(':countTokens')
                        ? { totalTokens: 700 }
                        : { candidates: [{ content: { role: 'model', parts: [{ text: 'Synthetic answer.' }] } }] }
                ),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            )
        }) as any
        const sdk = new GoogleGenerativeAI('synthetic-key-not-a-credential')
        const model = sdk.getGenerativeModel({
            model: 'gemini-synthetic-test',
            generationConfig: { maxOutputTokens: 200 },
            systemInstruction: 'Synthetic system.',
            tools: [{ functionDeclarations: [{ name: 'synthetic_tool' }] }]
        })
        ;(model as any).cachedContent = { name: 'cachedContents/synthetic-fixture-only' }
        const prepared = await prepareTobyBudgetedRequest(model, request(), config)
        model.systemInstruction = { role: 'system', parts: [{ text: 'Changed after count.' }] }
        model.generationConfig.maxOutputTokens = 999
        await model.generateContent(prepared)
        expect(bodies).toHaveLength(2)
        expect(bodies[0].url).toContain('models/gemini-synthetic-test:countTokens')
        expect(bodies[1].url).toContain('models/gemini-synthetic-test:generateContent')
        const { model: countedModel, ...countedRequest } = bodies[0].body.generateContentRequest
        expect(countedModel).toBe('models/gemini-synthetic-test')
        expect(countedRequest).toEqual(bodies[1].body)
        expect(countedRequest.cachedContent).toBe('cachedContents/synthetic-fixture-only')
    })
    it('does not merge a later system instruction into a counted request with none', async () => {
        const bodies: any[] = []
        global.fetch = jest.fn(async (url: any, init: any) => {
            bodies.push(JSON.parse(init.body))
            return new Response(JSON.stringify(String(url).includes(':countTokens') ? { totalTokens: 0 } : { candidates: [] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            })
        }) as any
        const model = new GoogleGenerativeAI('synthetic-key-not-a-credential').getGenerativeModel({
            model: 'gemini-synthetic-test',
            generationConfig: { maxOutputTokens: 200 }
        })
        const prepared = await prepareTobyBudgetedRequest(model, request(), config)
        model.systemInstruction = { role: 'system', parts: [{ text: 'Uncounted mutation.' }] }
        await model.generateContent(prepared)
        const { model: _, ...countedRequest } = bodies[0].generateContentRequest
        expect(countedRequest).toEqual(bodies[1])
        expect(bodies[1].systemInstruction).toBeUndefined()
    })
    it('uses the same complete JSON when generation is streamed', async () => {
        const bodies: { url: string; body: any }[] = []
        global.fetch = jest.fn(async (url: any, init: any) => {
            bodies.push({ url: String(url), body: JSON.parse(init.body) })
            if (String(url).includes(':countTokens')) {
                return new Response(JSON.stringify({ totalTokens: 10 }), { status: 200, headers: { 'Content-Type': 'application/json' } })
            }
            return new Response(
                'data: ' +
                    JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'Synthetic streamed answer.' }] } }] }) +
                    '\n\n',
                { status: 200, headers: { 'Content-Type': 'text/event-stream' } }
            )
        }) as any
        const model = new GoogleGenerativeAI('synthetic-key-not-a-credential').getGenerativeModel({
            model: 'gemini-synthetic-test',
            generationConfig: { maxOutputTokens: 200 },
            systemInstruction: 'Synthetic system.'
        })
        const prepared = await prepareTobyBudgetedRequest(model, request(), config)
        const result = await model.generateContentStream(prepared)
        for await (const _ of result.stream) {
            /* Consume synthetic SDK stream to exercise actual transport parsing. */
        }
        const { model: _, ...countedRequest } = bodies[0].body.generateContentRequest
        expect(bodies[1].url).toContain(':streamGenerateContent')
        expect(countedRequest).toEqual(bodies[1].body)
    })
})
