import { EventEmitter } from 'node:events'
import textToSpeech from './index'
import { convertTextToSpeechStream } from 'flowise-components'

const mockControllers = new Map<string, AbortController>()
const mockPool = {
    add: jest.fn((id, controller) => mockControllers.set(id, controller)),
    remove: jest.fn((id) => mockControllers.delete(id)),
    get: jest.fn((id) => mockControllers.get(id)),
    abort: jest.fn()
}
jest.mock('flowise-components', () => ({ convertTextToSpeechStream: jest.fn() }))
jest.mock('../../services/chatflows', () => ({ __esModule: true, default: { getChatflowById: jest.fn() } }))
jest.mock('../../services/text-to-speech', () => ({ __esModule: true, default: { getVoices: jest.fn() } }))
jest.mock('../../utils', () => ({ databaseEntities: {} }))
jest.mock('../../utils/getRunningExpressApp', () => ({ getRunningExpressApp: () => ({ abortControllerPool: mockPool }) }))

const converter = convertTextToSpeechStream as jest.Mock
const request = () => ({
    body: {
        text: 'A harmless test.',
        provider: 'inworld',
        credentialId: 'synthetic-credential',
        voice: 'catalogue-voice',
        model: 'inworld-tts-2-flash',
        chatId: 'synthetic-chat',
        chatMessageId: 'synthetic-message'
    }
})
const response = () => {
    const res = new EventEmitter() as any
    res.headersSent = false
    res.destroyed = false
    res.writableEnded = false
    res.setHeader = jest.fn()
    res.write = jest.fn(() => {
        res.headersSent = true
    })
    res.end = jest.fn(() => {
        res.writableEnded = true
        res.emit('close')
    })
    return res
}

beforeEach(() => {
    jest.clearAllMocks()
    mockControllers.clear()
})

it('preserves the native MP3 start/data/end contract and cleans the controller without aborting normal completion', async () => {
    converter.mockImplementation(async (_text, _config, _options, _abort, start, chunk, end) => {
        start('mp3')
        chunk(Buffer.from('audio'))
        await end()
    })
    const res = response()
    await textToSpeech.generateTextToSpeech(request() as any, res)
    const signal = converter.mock.calls[0][3].signal
    expect(signal.aborted).toBe(false)
    expect(res.write.mock.calls.map((call: any[]) => call[0]).join('')).toContain('"audioChunk":"YXVkaW8="')
    expect(res.write.mock.calls.map((call: any[]) => call[0]).join('')).toContain('"event":"tts_end"')
    expect(mockPool.remove).toHaveBeenCalledTimes(1)
    expect(mockPool.remove).toHaveBeenCalledWith('tts_synthetic-chat_synthetic-message')
    expect(res.listenerCount('close')).toBe(0)
})

it('passes administrator preview direction, delivery mode and speaking rate to the shared provider path', async () => {
    converter.mockImplementation(async (_text, _config, _options, _abort, start, chunk, end) => {
        start('mp3')
        chunk(Buffer.from('audio'))
        await end()
    })
    const req = request()
    Object.assign(req.body, { model: 'inworld-tts-2', instruction: 'Warm and patient.', deliveryMode: 'STABLE', speakingRate: 0.9 })
    await textToSpeech.generateTextToSpeech(req as any, response())
    expect(converter.mock.calls[0][1]).toEqual(
        expect.objectContaining({
            name: 'inworld',
            model: 'inworld-tts-2',
            instruction: 'Warm and patient.',
            deliveryMode: 'STABLE',
            speakingRate: 0.9
        })
    )
})

it('aborts pending synthesis on response disconnect and never writes to the closed response', async () => {
    converter.mockImplementation(
        (_text, _config, _options, abort) =>
            new Promise((_resolve, reject) => {
                abort.signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true })
            })
    )
    const res = response()
    const synthesis = textToSpeech.generateTextToSpeech(request() as any, res)
    res.destroyed = true
    res.emit('close')
    await synthesis
    expect(converter.mock.calls[0][3].signal.aborted).toBe(true)
    expect(mockPool.remove).toHaveBeenCalledTimes(1)
    expect(res.write).not.toHaveBeenCalled()
    expect(res.end).not.toHaveBeenCalled()
    expect(res.listenerCount('close')).toBe(0)
})

it('finishes explicit cancellation with the matching abort event instead of a successful end or provider error', async () => {
    converter.mockImplementation(async (_text, _config, _options, abort) => {
        abort.abort()
        throw new Error('Provider aborted')
    })
    const res = response()
    await textToSpeech.generateTextToSpeech(request() as any, res)
    const output = res.write.mock.calls.map((call: any[]) => call[0]).join('')
    expect(output).toContain('"event":"tts_abort","data":{"chatMessageId":"synthetic-message"}')
    expect(output).not.toContain('tts_end')
    expect(output).not.toContain('tts_error')
    expect(res.end).toHaveBeenCalledTimes(1)
    expect(mockPool.remove).toHaveBeenCalledTimes(1)
})

it('does not expose raw provider errors or report incomplete synthesis as success', async () => {
    converter.mockRejectedValue(new Error('synthetic-secret-and-private-text'))
    const res = response()
    await textToSpeech.generateTextToSpeech(request() as any, res)
    const output = res.write.mock.calls.map((call: any[]) => call[0]).join('')
    expect(output).toContain('Speech is unavailable right now.')
    expect(output).toContain('"chatMessageId":"synthetic-message"')
    expect(output).not.toContain('synthetic-secret')
    expect(output).not.toContain('tts_end')
    expect(mockPool.remove).toHaveBeenCalledTimes(1)
})

it('replaces an older generation without allowing its cleanup to remove the new replay controller', async () => {
    converter.mockImplementation(
        (_text, _config, _options, abort) =>
            new Promise((_resolve, reject) => {
                abort.signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true })
            })
    )
    const firstResponse = response()
    const secondResponse = response()
    const first = textToSpeech.generateTextToSpeech(request() as any, firstResponse)
    const second = textToSpeech.generateTextToSpeech(request() as any, secondResponse)
    await first
    expect(converter.mock.calls[0][3].signal.aborted).toBe(true)
    expect(mockPool.get('tts_synthetic-chat_synthetic-message')).toBe(converter.mock.calls[1][3])
    expect(mockPool.remove).not.toHaveBeenCalled()
    secondResponse.destroyed = true
    secondResponse.emit('close')
    await second
    expect(mockPool.remove).toHaveBeenCalledTimes(1)
})
