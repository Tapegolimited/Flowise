jest.mock('@langchain/google-genai', () => ({ ChatGoogleGenerativeAI: class {} }))

import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from './FlowiseChatGoogleGenerativeAI'

const budget = { contextWindowTokens: 1000, marginTokens: 100, timeoutMs: 50 }
const syntheticResponse = {
    candidates: [{ content: { role: 'model', parts: [{ text: 'Synthetic tutor answer.' }] } }],
    usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 2, totalTokenCount: 12 }
}

function modelFixture(enabled: boolean, streaming = false, totalTokens = 10): any {
    const instance: any = Object.create(ChatGoogleGenerativeAI.prototype)
    instance.tobyContextBudget = enabled ? budget : undefined
    instance.model = 'gemini-synthetic-test'
    instance._isMultimodalModel = true
    instance.useSystemInstruction = true
    instance.streaming = streaming
    instance.client = {
        model: 'models/gemini-synthetic-test',
        generationConfig: { maxOutputTokens: 200 },
        countTokens: jest.fn().mockResolvedValue({ totalTokens }),
        generateContentStream: jest.fn().mockImplementation(async () => ({
            stream: (async function* () {
                yield syntheticResponse
            })()
        }))
    }
    instance.invocationParams = jest.fn(() => ({ tools: [{ functionDeclarations: [{ name: 'synthetic_tool' }] }] }))
    instance.completionWithRetry = jest.fn().mockResolvedValue({ response: syntheticResponse })
    instance.caller = { callWithOptions: jest.fn(async (_: any, fn: any) => fn()) }
    return instance
}

function messages() {
    return [new SystemMessage('Synthetic tutor system.'), new HumanMessage('Synthetic expanded worksheet and recent history.')]
}

describe('provider seam, not early route byte counting', () => {
    it('keeps the disabled non-stream legacy arguments and makes no count RPC', async () => {
        const model = modelFixture(false)
        const result = await model._generate(messages(), {})
        expect(result.generations[0].text).toBe('Synthetic tutor answer.')
        expect(model.client.countTokens).not.toHaveBeenCalled()
        expect(model.completionWithRetry.mock.calls[0]).toHaveLength(1)
        expect(model.completionWithRetry.mock.calls[0][0].generationConfig).toBeUndefined()
    })
    it('counts non-streaming effective request once before generation and preserves output', async () => {
        const model = modelFixture(true)
        const result = await model._generate(messages(), {})
        expect(model.client.countTokens).toHaveBeenCalledTimes(1)
        expect(model.completionWithRetry).toHaveBeenCalledTimes(1)
        expect(model.client.countTokens.mock.invocationCallOrder[0]).toBeLessThan(model.completionWithRetry.mock.invocationCallOrder[0])
        const prepared = model.completionWithRetry.mock.calls[0][0]
        expect(model.client.countTokens.mock.calls[0][0].generateContentRequest).toBe(prepared)
        expect(prepared.systemInstruction.parts[0].text).toBe('Synthetic tutor system.')
        expect(prepared.contents[0].parts[0].text).toContain('Synthetic expanded worksheet')
        expect(result.generations[0].text).toBe('Synthetic tutor answer.')
    })
    it('does not generate non-streaming output when the full request exceeds budget', async () => {
        const model = modelFixture(true, false, 701)
        await expect(model._generate(messages(), {})).rejects.toMatchObject({ code: 'toby_context_budget_exceeded' })
        expect(model.completionWithRetry).not.toHaveBeenCalled()
    })
    it('keeps streaming behaviour OFF without a count', async () => {
        const model = modelFixture(false, true)
        const result = await model._generate(messages(), {})
        expect(model.client.countTokens).not.toHaveBeenCalled()
        expect(model.client.generateContentStream).toHaveBeenCalledTimes(1)
        expect(result.generations[0].text).toBe('Synthetic tutor answer.')
    })
    it('counts once, not twice, when _generate delegates to streaming', async () => {
        const model = modelFixture(true, true)
        const result = await model._generate(messages(), {})
        expect(model.client.countTokens).toHaveBeenCalledTimes(1)
        expect(model.client.generateContentStream).toHaveBeenCalledTimes(1)
        expect(model.completionWithRetry).not.toHaveBeenCalled()
        expect(model.client.countTokens.mock.calls[0][0].generateContentRequest).toBe(model.client.generateContentStream.mock.calls[0][0])
        expect(result.generations[0].text).toBe('Synthetic tutor answer.')
    })
    it('blocks streaming before a single chunk/provider generation if count is too large', async () => {
        const model = modelFixture(true, true, 701)
        const callback = { handleLLMNewToken: jest.fn() }
        await expect(model._generate(messages(), {}, callback)).rejects.toThrow('toby_context_budget_exceeded')
        expect(model.client.generateContentStream).not.toHaveBeenCalled()
        expect(callback.handleLLMNewToken).not.toHaveBeenCalled()
    })
    it('recounts tool-result scratchpad on subsequent agent iterations', async () => {
        const model = modelFixture(true)
        await model._generate(messages(), {})
        await model._generate(
            [
                ...messages(),
                new AIMessage({ content: '', tool_calls: [{ id: 'synthetic-call', name: 'synthetic_tool', args: {} }] }),
                new ToolMessage({
                    content: 'Synthetic extra tool-result information.',
                    tool_call_id: 'synthetic-call',
                    name: 'synthetic_tool'
                })
            ],
            {}
        )
        expect(model.client.countTokens).toHaveBeenCalledTimes(2)
        const second = model.client.countTokens.mock.calls[1][0].generateContentRequest
        expect(JSON.stringify(second.contents)).toContain('Synthetic extra tool-result information.')
    })
    it('passes native count cancellation and preserves no-output failure', async () => {
        const controller = new AbortController()
        const model = modelFixture(true)
        model.client.countTokens.mockImplementation(() => new Promise(() => {}))
        const generation = model._generate(messages(), { signal: controller.signal })
        controller.abort()
        await expect(generation).rejects.toThrow('toby_context_budget_aborted')
        expect(model.completionWithRetry).not.toHaveBeenCalled()
    })
})
