import { readTtsPreviewAudio } from './ttsPreview'

const id = 'synthetic-preview'
const encoder = new TextEncoder()
const frame = (event, extra = {}) => `event: ${event}\ndata: ${JSON.stringify({ event, data: { chatMessageId: id, ...extra } })}\n\n`
const start = frame('tts_start', { format: 'mp3' })
const audio = frame('tts_data', { audioChunk: btoa('audio') })
const end = frame('tts_end')
const response = (parts) =>
    new Response(
        new ReadableStream({
            start(controller) {
                for (const part of parts) controller.enqueue(encoder.encode(part))
                controller.close()
            }
        })
    )

it('accepts fragmented frames and builds a preview only after matching successful end and clean EOF', async () => {
    const stream = (start + audio + end).replace(/\n/g, '\r\n')
    const result = await readTtsPreviewAudio(response([stream.slice(0, 11), stream.slice(11, 63), stream.slice(63)]), id)
    expect(new TextDecoder().decode(result)).toBe('audio')
})

it.each(['tts_error', 'tts_abort', 'error'])('rejects partial %s audio instead of displaying a successful preview', async (event) => {
    await expect(readTtsPreviewAudio(response([start + audio + frame(event)]), id)).rejects.toThrow('did not finish')
})

it('rejects a truncated stream, mismatched identity, data before start and audio after end', async () => {
    for (const stream of [
        start + audio,
        start + audio + frame('tts_end', { chatMessageId: 'different-preview' }),
        audio + end,
        start + audio + end + audio
    ]) {
        await expect(readTtsPreviewAudio(response([stream]), id)).rejects.toThrow()
    }
})

it('does not turn a late response-reader failure into a successful preview', async () => {
    let chunks = 0
    const stream = new ReadableStream({
        pull(controller) {
            if (chunks++ === 0) controller.enqueue(encoder.encode(start + audio + end))
            else controller.error(new Error('Connection interrupted'))
        }
    })
    await expect(readTtsPreviewAudio(new Response(stream), id)).rejects.toThrow('Connection interrupted')
})
