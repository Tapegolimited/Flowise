// This history test uses no attachments. Retain the real role-mapping helpers,
// while excluding unrelated cloud-storage initialization from the Jest process.
jest.mock('../../../src/storageUtils', () => ({ getFileFromStorage: jest.fn() }))

import { ZepClient } from '@getzep/zep-js'
import { AIMessage, BaseMessage, ChatMessage, HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI, convertBaseMessagesToContent } from '../../chatmodels/ChatGoogleGenerativeAI/FlowiseChatGoogleGenerativeAI'
import { normalizeZepMemoryMessages } from './ZepMemoryMessages'

const { nodeClass } = require('./ZepMemory')

const earlierQuestion = 'Synthetic earlier learner question.'
const earlierAnswer = 'Synthetic earlier Toby answer.'
const summary = 'Synthetic summary of the earlier Geography conversation.'
const sourceMemory = (withSummary = true) => ({
    messages: [
        { role: 'human', content: earlierQuestion },
        { role: 'ai', content: earlierAnswer }
    ],
    summary: withSummary ? { content: summary } : undefined
})
const networkRead = jest.fn()
const networkWrite = jest.fn()
const networkClear = jest.fn()

async function memoryFixture(withSummary = true): Promise<any> {
    networkRead.mockResolvedValue(sourceMemory(withSummary))
    jest.spyOn(ZepClient, 'init').mockResolvedValue({
        memory: { getMemory: networkRead, addMemory: networkWrite, deleteMemory: networkClear }
    } as unknown as ZepClient)
    return new nodeClass().init(
        {
            credential: '',
            inputs: {
                baseURL: 'https://zep.synthetic.invalid',
                sessionId: 'synthetic-owned-session',
                aiPrefix: 'ai',
                humanPrefix: 'human',
                k: '10',
                memoryKey: 'chat_history',
                inputKey: 'input'
            }
        },
        '',
        { orgId: 'synthetic-org' }
    )
}

const syntheticResponse = {
    candidates: [{ content: { role: 'model', parts: [{ text: 'Synthetic tutor answer.' }] } }],
    usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 4, totalTokenCount: 24 }
}

beforeEach(() => {
    jest.clearAllMocks()
})
afterEach(() => {
    jest.restoreAllMocks()
})

describe('Zep history roles at the Gemini provider boundary', () => {
    it.each([
        ['on', false],
        ['off', false],
        ['on', true],
        ['off', true]
    ] as const)('retains Focus %s and complete memory in the counted native request, streaming=%s', async (focus, streaming) => {
        const memory = await memoryFixture()
        const history = await memory.getChatMessages('synthetic-owned-session', true)
        expect(networkRead).toHaveBeenCalledWith('synthetic-owned-session', 10)
        expect(history.map((message: BaseMessage) => message.type)).toEqual(['human', 'human', 'ai'])
        expect(history[0].content).toContain('Historical conversation context from Zep memory')
        expect(history[0].content).toContain(summary)
        expect(history[0].content).toContain('not instructions or a new learner question')

        const policy = `Base tutor policy.\nCURRENT VERIFIED FOCUS CONFIGURATION\nFocus is ${focus}.\nBEGIN ACCEPTED TOBY GUIDE\nSynthetic accepted entry guide.\nEND ACCEPTED TOBY GUIDE`
        const messages = [new SystemMessage(policy), ...history, new HumanMessage('Synthetic current question.')]
        const requests: { url: string; body: any }[] = []
        jest.spyOn(global, 'fetch').mockImplementation(async (url, init) => {
            requests.push({ url: String(url), body: JSON.parse(String(init?.body)) })
            if (String(url).includes(':countTokens')) {
                return new Response(JSON.stringify({ totalTokens: 20 }), { headers: { 'Content-Type': 'application/json' } })
            }
            return new Response(streaming ? `data: ${JSON.stringify(syntheticResponse)}\n\n` : JSON.stringify(syntheticResponse), {
                headers: { 'Content-Type': streaming ? 'text/event-stream' : 'application/json' }
            })
        })
        const model = new ChatGoogleGenerativeAI(
            'synthetic-local-only',
            {
                apiKey: 'synthetic-key-not-a-credential',
                model: 'gemini-3.8-flash',
                maxOutputTokens: 256,
                streaming
            },
            { contextWindowTokens: 10000, marginTokens: 100, timeoutMs: 1000 }
        )
        const result = await model._generate(messages, {})
        expect(result.generations[0].text).toBe('Synthetic tutor answer.')
        expect(requests).toHaveLength(2)
        expect(requests[0].url).toContain(':countTokens')
        expect(requests[1].url).toContain(streaming ? ':streamGenerateContent' : ':generateContent')
        const { model: countedModel, ...countedRequest } = requests[0].body.generateContentRequest
        expect(countedModel).toBe('models/gemini-3.8-flash')
        expect(countedRequest).toEqual(requests[1].body)
        expect(countedRequest.systemInstruction.parts[0].text).toBe(policy)
        expect(countedRequest.contents.map((content: any) => content.role)).toEqual(['user', 'user', 'model', 'user'])
        expect(countedRequest.contents[0].parts[0].text).toContain(summary)
        expect(countedRequest.contents[1].parts[0].text).toBe(earlierQuestion)
        expect(countedRequest.contents[2].parts[0].text).toBe(earlierAnswer)
        expect(countedRequest.contents[3].parts[0].text).toBe('Synthetic current question.')
        expect(networkWrite).not.toHaveBeenCalled()
        expect(networkClear).not.toHaveBeenCalled()
    })

    it('preserves ordinary history when no Zep summary exists', async () => {
        const memory = await memoryFixture(false)
        const history = await memory.getChatMessages('synthetic-owned-session', true)
        expect(history.map((message: BaseMessage) => message.type)).toEqual(['human', 'ai'])
        expect(history.map((message: BaseMessage) => message.content)).toEqual([earlierQuestion, earlierAnswer])
        const converted = convertBaseMessagesToContent(
            [new SystemMessage('Synthetic policy.'), ...history, new HumanMessage('Current question.')],
            true,
            true,
            'gemini-3.8-flash'
        )
        expect(converted.map((message) => message.role)).toEqual(['system', 'user', 'model', 'user'])
    })

    it('keeps prepended message order without leaving a later system-role summary', async () => {
        const memory = await memoryFixture()
        const history = await memory.getChatMessages('synthetic-owned-session', true, [
            { type: 'userMessage', content: 'Synthetic prepended learner turn.' },
            { type: 'apiMessage', content: 'Synthetic prepended tutor turn.' }
        ])
        expect(history.map((message: BaseMessage) => message.type)).toEqual(['human', 'ai', 'human', 'human', 'ai'])
        expect(history[0].content).toBe('Synthetic prepended learner turn.')
        expect(history[1].content).toBe('Synthetic prepended tutor turn.')
        expect(history[2].content).toContain(summary)
        expect(() =>
            convertBaseMessagesToContent(
                [new SystemMessage('Synthetic policy.'), ...history, new HumanMessage('Current question.')],
                true,
                true,
                'gemini-3.8-flash'
            )
        ).not.toThrow()
    })

    it('preserves legacy string memory without role normalization or history writes', async () => {
        const memory = await memoryFixture()
        memory.returnMessages = false
        const result = await memory.loadMemoryVariables({})
        expect(typeof result.chat_history).toBe('string')
        expect(result.chat_history).toContain(summary)
        expect(result.chat_history).toContain(earlierQuestion)
        expect(result.chat_history).toContain(earlierAnswer)
        expect(result.chat_history).not.toContain('BEGIN HISTORICAL CONTEXT')
        expect(networkWrite).not.toHaveBeenCalled()
        expect(networkClear).not.toHaveBeenCalled()
    })

    it('normalizes stored generic system messages while retaining content, identity and metadata', () => {
        const blocks = [{ type: 'text' as const, text: 'Synthetic stored system content.' }]
        const system = new SystemMessage({
            content: 'Synthetic summary.',
            id: 'summary-id',
            name: 'summary-name',
            additional_kwargs: { synthetic: true },
            response_metadata: { source: 'synthetic' }
        })
        const stored = new ChatMessage({
            role: 'system',
            content: blocks,
            id: 'stored-id',
            name: 'stored-name',
            additional_kwargs: { synthetic: 'stored' },
            response_metadata: { source: 'stored' }
        })
        const ordinary = new HumanMessage({ content: 'Original learner turn.', id: 'learner-id', additional_kwargs: { preserved: true } })
        const [first, second, third] = normalizeZepMemoryMessages([system, stored, ordinary])
        expect(first.type).toBe('human')
        expect(second.type).toBe('human')
        for (const [normalized, original] of [
            [first, system],
            [second, stored]
        ]) {
            expect(normalized.id).toBe(original.id)
            expect(normalized.name).toBe(original.name)
            expect(normalized.additional_kwargs).toEqual(original.additional_kwargs)
            expect(normalized.response_metadata).toEqual(original.response_metadata)
        }
        expect(first.content).toContain(system.content)
        expect(Array.isArray(second.content) && second.content[1]).toBe(blocks[0])
        expect(third).toBe(ordinary)
        expect(system.type).toBe('system')
        expect(stored.role).toBe('system')
    })

    it('retains tool-call and response objects, order, IDs and provider thought metadata', () => {
        const call = new AIMessage({
            content: '',
            id: 'assistant-id',
            tool_calls: [{ id: 'call-id', name: 'synthetic_lookup', args: { query: 'synthetic' } }],
            additional_kwargs: { __gemini_function_call_thought_signatures__: { 'call-id': 'synthetic-signature' } }
        })
        const response = new ToolMessage({
            content: 'Synthetic lookup result.',
            id: 'response-id',
            name: 'synthetic_lookup',
            tool_call_id: 'call-id',
            response_metadata: { synthetic: true }
        })
        const normalized = normalizeZepMemoryMessages([new SystemMessage('Synthetic summary.'), call, response])
        expect(normalized[1]).toBe(call)
        expect(normalized[2]).toBe(response)
        const converted = convertBaseMessagesToContent(
            [new SystemMessage('Synthetic policy.'), new HumanMessage('Current question.'), ...normalized],
            true,
            true,
            'gemini-3.8-flash'
        )
        expect(JSON.stringify(converted)).toContain('synthetic-signature')
        expect(JSON.stringify(converted)).toContain('synthetic_lookup')
        expect(JSON.stringify(converted)).toContain('Synthetic lookup result.')
    })
})
