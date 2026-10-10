import { Readable } from 'node:stream'
import { convertTextToSpeechStream } from './textToSpeech'
import { getCredentialData } from './utils'

const mockOpenAISpeechCreate = jest.fn()
const mockElevenLabsStream = jest.fn()

jest.mock('./utils', () => ({
    getCredentialData: jest.fn().mockResolvedValue({ openAIApiKey: 'synthetic-openai-key', elevenLabsApiKey: 'synthetic-elevenlabs-key' })
}))
jest.mock('openai', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({ audio: { speech: { create: mockOpenAISpeechCreate } } }))
}))
jest.mock('@elevenlabs/elevenlabs-js', () => ({
    ElevenLabsClient: jest.fn().mockImplementation(() => ({ textToSpeech: { stream: mockElevenLabsStream } }))
}))

describe.each(['openai', 'elevenlabs'])('visual speech projection: %s', (provider) => {
    const config = { name: provider, credentialId: 'synthetic-credential', voice: 'alloy' }
    const options = { workspaceId: 'synthetic-workspace' }
    const original = 'Look at this.\n```toby-diagram\n{"v":1,"p":{"private_value":91}}\n```\nWhat do you notice?'
    const expected = 'Look at this.\nVisual.\nWhat do you notice?'
    const providerMock = () => (provider === 'openai' ? mockOpenAISpeechCreate : mockElevenLabsStream)
    const providerInput = () => {
        const args = providerMock().mock.calls[0]
        return provider === 'openai' ? args[0].input : args[1].text
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockOpenAISpeechCreate.mockImplementation(async () => ({ body: Readable.toWeb(Readable.from([Buffer.from('synthetic-audio')])) }))
        mockElevenLabsStream.mockImplementation(async () => Readable.toWeb(Readable.from([Buffer.from('synthetic-audio')])))
    })

    it('filters only the provider input and preserves the source, options, signal and audio callbacks', async () => {
        const message = { text: original }
        const abort = new AbortController()
        const onStart = jest.fn(),
            onChunk = jest.fn(),
            onEnd = jest.fn()
        await convertTextToSpeechStream(message.text, config, options, abort, onStart, onChunk, onEnd)
        expect(providerMock()).toHaveBeenCalledTimes(1)
        expect(providerInput()).toBe(expected)
        expect(message.text).toBe(original)
        expect(getCredentialData).toHaveBeenCalledWith('synthetic-credential', options)
        expect(onStart).toHaveBeenCalledWith('mp3')
        expect(onChunk).toHaveBeenCalledWith(Buffer.from('synthetic-audio'))
        expect(onEnd).toHaveBeenCalledTimes(1)
        const args = providerMock().mock.calls[0]
        expect(provider === 'openai' ? args[1].signal : args[2].abortSignal).toBe(abort.signal)
        expect(provider === 'openai' ? args[0].model : args[1].modelId).toBe(
            provider === 'openai' ? 'gpt-4o-mini-tts' : 'eleven_multilingual_v2'
        )
    })

    it('preserves ordinary educational JSON and plain prose', async () => {
        const text = 'Compare these values.\n```json\n{"example":4}\n```'
        await convertTextToSpeechStream(text, config, options, new AbortController(), jest.fn(), jest.fn(), jest.fn())
        expect(providerInput()).toBe(text)
    })

    it('does not contact a provider when already aborted', async () => {
        const abort = new AbortController()
        abort.abort()
        await expect(convertTextToSpeechStream(original, config, options, abort, jest.fn(), jest.fn(), jest.fn())).rejects.toThrow(
            'aborted'
        )
        expect(providerMock()).not.toHaveBeenCalled()
        expect(getCredentialData).not.toHaveBeenCalled()
    })

    it('preserves in-flight abort and never completes aborted playback', async () => {
        const abort = new AbortController()
        const onEnd = jest.fn()
        providerMock().mockImplementation((...args: any[]) => {
            const signal: AbortSignal = provider === 'openai' ? args[1].signal : args[2].abortSignal
            return new Promise((_resolve, reject) =>
                signal.addEventListener('abort', () => reject(new Error('Provider aborted')), { once: true })
            )
        })
        const playback = convertTextToSpeechStream(original, config, options, abort, jest.fn(), jest.fn(), onEnd)
        await Promise.resolve()
        await Promise.resolve()
        abort.abort()
        await expect(playback).rejects.toThrow('aborted')
        expect(providerInput()).toBe(expected)
        expect(onEnd).not.toHaveBeenCalled()
    })
})
