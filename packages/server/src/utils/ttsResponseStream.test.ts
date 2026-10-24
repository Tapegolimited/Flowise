import { generateTTSForResponseStream } from './ttsResponseStream'
import { convertTextToSpeechStream } from 'flowise-components'
import logger from './logger'

jest.mock('flowise-components', () => ({ convertTextToSpeechStream: jest.fn() }))
jest.mock('./logger', () => ({ __esModule: true, default: { error: jest.fn() } }))
const convert = convertTextToSpeechStream as jest.Mock
const configuration = JSON.stringify({
    inworld: {
        status: true,
        credentialId: 'synthetic-credential',
        voice: 'Felix',
        model: 'inworld-tts-2',
        instruction: 'Warm and patient.',
        deliveryMode: 'STABLE',
        speakingRate: 0.9
    }
})
const streamer = () => ({
    streamTTSStartEvent: jest.fn(),
    streamTTSDataEvent: jest.fn(),
    streamTTSEndEvent: jest.fn(),
    streamCustomEvent: jest.fn(),
    streamEndEvent: jest.fn(),
    streamAbortEvent: jest.fn()
})
beforeEach(() => {
    jest.clearAllMocks()
})

it('uses the shared provider configuration and preserves normal automatic speech completion', async () => {
    convert.mockImplementation(async (_text, _config, _options, _abort, start, data, end) => {
        start('mp3')
        data(Buffer.from('audio'))
        end()
    })
    const events = streamer()
    await generateTTSForResponseStream('A reply.', configuration, {}, 'synthetic-chat', 'synthetic-message', events as any)
    expect(convert.mock.calls[0][1]).toEqual(
        expect.objectContaining({ name: 'inworld', instruction: 'Warm and patient.', deliveryMode: 'STABLE', speakingRate: 0.9 })
    )
    expect(events.streamTTSEndEvent).toHaveBeenCalledWith('synthetic-chat', 'synthetic-message')
    expect(events.streamCustomEvent).not.toHaveBeenCalled()
})

it('marks failed partial speech without falsely completing audio, leaking provider errors or aborting the text prediction', async () => {
    convert.mockImplementation(async (_text, _config, _options, _abort, start, data) => {
        start('mp3')
        data(Buffer.from('partial'))
        throw new Error('synthetic-private-provider-detail')
    })
    const events = streamer()
    await generateTTSForResponseStream('A reply.', configuration, {}, 'synthetic-chat', 'synthetic-message', events as any)
    expect(events.streamCustomEvent).toHaveBeenNthCalledWith(1, 'synthetic-chat', 'tts_error', {
        chatMessageId: 'synthetic-message',
        error: 'Speech is unavailable right now.'
    })
    expect(events.streamCustomEvent).toHaveBeenNthCalledWith(2, 'synthetic-chat', 'tts_abort', { chatMessageId: 'synthetic-message' })
    expect(events.streamTTSEndEvent).not.toHaveBeenCalled()
    expect(events.streamEndEvent).not.toHaveBeenCalled()
    expect(events.streamAbortEvent).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalledWith('[server]: TTS streaming failed')
})

it('keeps explicit automatic-speech cancellation distinct from provider failure', async () => {
    const abort = new AbortController()
    convert.mockImplementation(async () => {
        abort.abort()
        throw new Error('aborted')
    })
    const events = streamer()
    await generateTTSForResponseStream('A reply.', configuration, {}, 'synthetic-chat', 'synthetic-message', events as any, abort)
    expect(events.streamCustomEvent).toHaveBeenCalledTimes(1)
    expect(events.streamCustomEvent).toHaveBeenCalledWith('synthetic-chat', 'tts_abort', { chatMessageId: 'synthetic-message' })
    expect(events.streamTTSEndEvent).not.toHaveBeenCalled()
    expect(logger.error).not.toHaveBeenCalled()
})
