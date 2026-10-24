/** A preview is usable only after matching start/audio/end events and a clean stream EOF. */
export const readTtsPreviewAudio = async (response, chatMessageId) => {
    if (!response.ok || !response.body) throw new Error('Speech preview is unavailable right now.')
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    const chunks = []
    let buffer = ''
    let started = false
    let ended = false
    let totalBytes = 0
    let complete = false
    const consume = (block) => {
        if (!block.trim()) return
        const data = block
            .split('\n')
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.slice(5).trim())
            .join('\n')
        let event
        try {
            event = JSON.parse(data)
        } catch {
            throw new Error('Speech preview returned an invalid stream.')
        }
        if (event.event === 'error' || event.event === 'tts_error' || event.event === 'tts_abort') {
            throw new Error('Speech preview did not finish. Please try again.')
        }
        if (event.data?.chatMessageId !== chatMessageId || ended) throw new Error('Speech preview returned an invalid stream.')
        if (event.event === 'tts_start') {
            if (started || event.data.format !== 'mp3') throw new Error('Speech preview returned an invalid stream.')
            started = true
        } else if (event.event === 'tts_data') {
            const value = event.data.audioChunk
            if (!started || typeof value !== 'string' || !value || value.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
                throw new Error('Speech preview returned invalid audio.')
            }
            const bytes = Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
            totalBytes += bytes.length
            if (!bytes.length || totalBytes > 64 * 1024 * 1024) throw new Error('Speech preview exceeded the supported size.')
            chunks.push(bytes)
        } else if (event.event === 'tts_end') {
            if (!started || !totalBytes) throw new Error('Speech preview returned no audio.')
            ended = true
        } else throw new Error('Speech preview returned an invalid stream.')
    }
    try {
        for (;;) {
            const { done, value } = await reader.read()
            if (done) break
            buffer = (buffer + decoder.decode(value, { stream: true })).replace(/\r\n/g, '\n')
            let boundary
            while ((boundary = buffer.indexOf('\n\n')) !== -1) {
                if (boundary > 1024 * 1024) throw new Error('Speech preview exceeded the supported frame size.')
                consume(buffer.slice(0, boundary))
                buffer = buffer.slice(boundary + 2)
            }
            if (buffer.length > 1024 * 1024) throw new Error('Speech preview exceeded the supported frame size.')
        }
        buffer += decoder.decode()
        if (buffer.trim()) consume(buffer)
        if (!ended) throw new Error('Speech preview did not finish. Please try again.')
        const audio = new Uint8Array(totalBytes)
        let offset = 0
        for (const chunk of chunks) {
            audio.set(chunk, offset)
            offset += chunk.length
        }
        complete = true
        return audio
    } finally {
        if (!complete) await reader.cancel().catch(() => undefined)
        reader.releaseLock()
    }
}
