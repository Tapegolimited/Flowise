/** Inworld is deliberately scoped to speech; it must never redirect other OpenAI clients. */
const INWORLD_API_ORIGIN = 'https://api.inworld.ai'
export const INWORLD_DEFAULT_MODEL = 'inworld-tts-2-flash'
const INWORLD_MODELS = new Set([INWORLD_DEFAULT_MODEL, 'inworld-tts-2'])
const MAX_TEXT_UNITS = 4000
const MAX_TOTAL_TEXT_UNITS = 40000
const MAX_JSON_LINE_UNITS = 4 * 1024 * 1024

interface InworldSpeechConfig {
    apiKey: string
    voice: string
    model?: string
    instruction?: string
    deliveryMode?: string
    speakingRate?: number | string
}

const assertActive = (signal: AbortSignal) => {
    if (signal.aborted) throw new Error('TTS generation aborted')
}

const authorization = (apiKey: string) => {
    const key = typeof apiKey === 'string' ? apiKey.trim() : ''
    if (!key || /[\r\n]/.test(key)) throw new Error('Configure an Inworld API credential before using speech.')
    // The Portal already supplies Base64 credentials. Encoding them again breaks authentication.
    return `Basic ${key}`
}

/** Preserve every UTF-16 unit, without cutting a surrogate pair or exceeding the provider limit. */
export const splitInworldSpeechText = (text: string, maxUnits = MAX_TEXT_UNITS): string[] => {
    if (!Number.isInteger(maxUnits) || maxUnits < 2 || maxUnits > MAX_TEXT_UNITS) throw new Error('Invalid speech segment limit.')
    const segments: string[] = []
    let remaining = text
    while (remaining.length > maxUnits) {
        let end = maxUnits
        const head = remaining.slice(0, end)
        const boundaries = [...head.matchAll(/[.!?]["')\]]*\s+|\n+/g)]
        const last = boundaries[boundaries.length - 1]
        const sentenceEnd = last ? last.index! + last[0].length : 0
        if (sentenceEnd >= maxUnits / 2) end = sentenceEnd
        else {
            const whitespace = Math.max(head.lastIndexOf(' '), head.lastIndexOf('\t'))
            if (whitespace >= maxUnits / 2) end = whitespace + 1
        }
        if (/[\uD800-\uDBFF]/.test(remaining[end - 1]) && /[\uDC00-\uDFFF]/.test(remaining[end])) end--
        segments.push(remaining.slice(0, end))
        remaining = remaining.slice(end)
    }
    if (remaining) segments.push(remaining)
    return segments
}

/** Answer brackets are literal content, never provider instructions. Stored text and copy stay untouched. */
export const projectInworldSpeechText = (text: string) =>
    text.replace(/\[|\]/g, (bracket) => (bracket === '[' ? ' open square bracket ' : ' close square bracket '))

const requestError = (status: number) => new Error(`Inworld speech request failed (HTTP ${status}).`)

/** Native HTTP streaming is NDJSON, with independently Base64-encoded audio in result.audioContent. */
export const streamInworldSpeech = async (
    text: string,
    config: InworldSpeechConfig,
    signal: AbortSignal,
    onStart: (format: string) => void,
    onChunk: (chunk: Buffer) => void,
    onEnd: () => void
): Promise<void> => {
    assertActive(signal)
    const auth = authorization(config.apiKey)
    const model = config.model || INWORLD_DEFAULT_MODEL
    if (!INWORLD_MODELS.has(model)) throw new Error('Choose a supported Inworld TTS-2 model.')
    if (config.instruction !== undefined && typeof config.instruction !== 'string') throw new Error('Use text for the voice direction.')
    const instruction = (config.instruction || '')
        .replace(/[\u0000-\u001F\u007F]|\[|\]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    if (instruction.length > 500) throw new Error('Use a voice direction of 500 characters or fewer.')
    if (model === INWORLD_DEFAULT_MODEL && (instruction || config.deliveryMode)) {
        throw new Error('Voice direction and delivery mode require Inworld TTS-2. Flash does not support steering.')
    }
    const deliveryMode = config.deliveryMode || 'BALANCED'
    if (!['STABLE', 'BALANCED', 'CREATIVE'].includes(deliveryMode)) throw new Error('Choose a supported Inworld delivery mode.')
    const speakingRate = config.speakingRate === undefined || config.speakingRate === '' ? 1 : Number(config.speakingRate)
    if (!Number.isFinite(speakingRate) || speakingRate < 0.5 || speakingRate > 1.5)
        throw new Error('Choose a speaking rate from 0.5 to 1.5.')
    if (!config.voice || typeof config.voice !== 'string' || !config.voice.trim()) {
        throw new Error('Choose an Inworld voice before using speech.')
    }
    if (!text.trim()) throw new Error('There is no readable text to speak.')
    const literalText = projectInworldSpeechText(text)
    if (literalText.length > MAX_TOTAL_TEXT_UNITS) throw new Error('This message exceeds the supported speech length.')
    const prefix = instruction ? `[${instruction}] ` : ''

    let started = false
    for (const segment of splitInworldSpeechText(literalText, MAX_TEXT_UNITS - prefix.length)) {
        assertActive(signal)
        const timeout = AbortSignal.timeout(60000)
        const upstreamSignal = AbortSignal.any([signal, timeout])
        const assertUpstreamActive = () => {
            assertActive(signal)
            if (timeout.aborted) throw new Error('Inworld speech request timed out.')
        }
        const response = await fetch(`${INWORLD_API_ORIGIN}/tts/v1/voice:stream`, {
            method: 'POST',
            redirect: 'error',
            headers: { Authorization: auth, 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                text: prefix + segment,
                voiceId: config.voice,
                modelId: model,
                language: 'en-GB',
                audioConfig: { audioEncoding: 'MP3', speakingRate },
                ...(model === 'inworld-tts-2' ? { deliveryMode } : {})
            }),
            signal: upstreamSignal
        }).catch(() => {
            assertUpstreamActive()
            throw new Error('Inworld speech request could not be completed.')
        })
        assertUpstreamActive()
        if (!response.ok) {
            await response.body?.cancel().catch(() => undefined)
            throw requestError(response.status)
        }
        if (!response.body) throw new Error('Inworld returned no audio stream.')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let pending = ''
        let audioReceived = false
        let finished = false
        const cancel = () => {
            void reader.cancel().catch(() => undefined)
        }
        upstreamSignal.addEventListener('abort', cancel, { once: true })
        const consume = (line: string) => {
            if (!line.trim()) return
            let message: any
            try {
                message = JSON.parse(line)
            } catch {
                throw new Error('Inworld returned an invalid audio stream.')
            }
            if (!message || typeof message !== 'object' || Array.isArray(message)) {
                throw new Error('Inworld returned an invalid audio stream.')
            }
            if (message.error) {
                const code = Number.isInteger(message.error.code) ? ` (code ${message.error.code})` : ''
                // Never forward arbitrary upstream errors, which may echo private input or credentials.
                throw new Error(`Inworld speech generation failed${code}.`)
            }
            const encoded = message.result?.audioContent
            if (encoded === undefined || encoded === '') return // Usage/timestamp-only frames are valid.
            if (typeof encoded !== 'string' || encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) {
                throw new Error('Inworld returned invalid audio data.')
            }
            const audio = Buffer.from(encoded, 'base64')
            if (!audio.length) throw new Error('Inworld returned invalid audio data.')
            assertUpstreamActive()
            if (!started) {
                onStart('mp3')
                started = true
            }
            // Provider NDJSON frames can be larger than the WordPress SSE boundary.
            for (let offset = 0; offset < audio.length; offset += 32 * 1024) {
                assertUpstreamActive()
                onChunk(audio.subarray(offset, offset + 32 * 1024))
            }
            audioReceived = true
        }

        try {
            for (;;) {
                assertUpstreamActive()
                const { done, value } = await reader.read().catch(() => {
                    assertUpstreamActive()
                    throw new Error('Inworld audio stream was interrupted.')
                })
                assertUpstreamActive()
                if (done) break
                pending += decoder.decode(value, { stream: true })
                let newline: number
                while ((newline = pending.indexOf('\n')) !== -1) {
                    if (newline > MAX_JSON_LINE_UNITS) throw new Error('Inworld audio frame exceeded the supported size.')
                    consume(pending.slice(0, newline))
                    pending = pending.slice(newline + 1)
                }
                if (pending.length > MAX_JSON_LINE_UNITS) throw new Error('Inworld audio frame exceeded the supported size.')
            }
            pending += decoder.decode()
            consume(pending) // A valid final NDJSON object need not end with a newline.
            if (!audioReceived) throw new Error('Inworld returned no audio data.')
            finished = true
        } finally {
            upstreamSignal.removeEventListener('abort', cancel)
            if (!finished) await reader.cancel().catch(() => undefined)
            reader.releaseLock()
        }
    }
    assertActive(signal)
    onEnd()
}

export const getInworldVoices = async (apiKey: string) => {
    const auth = authorization(apiKey)
    const voices = new Map<string, { id: string; name: string; category: string }>()
    const seenCursors = new Set<string>()
    let cursor = ''
    do {
        const url = new URL(`${INWORLD_API_ORIGIN}/voices/v1/voices`)
        url.searchParams.set('filter', 'lang_code="en"')
        url.searchParams.set('pageSize', '200')
        if (cursor) url.searchParams.set('pageToken', cursor)
        const response = await fetch(url, {
            headers: { Authorization: auth, Accept: 'application/json' },
            signal: AbortSignal.timeout(15000),
            redirect: 'error'
        })
        if (!response.ok) {
            await response.body?.cancel().catch(() => undefined)
            throw requestError(response.status)
        }
        let page: any
        try {
            page = await response.json()
        } catch {
            throw new Error('Inworld returned an invalid voice catalogue.')
        }
        if (!Array.isArray(page?.voices)) throw new Error('Inworld returned an invalid voice catalogue.')
        for (const voice of page.voices) {
            if (!voice || typeof voice !== 'object') continue
            if (typeof voice.voiceId !== 'string' || !voice.voiceId || typeof voice.displayName !== 'string') continue
            const tags = Array.isArray(voice.tags) ? voice.tags.filter((tag: unknown) => typeof tag === 'string') : []
            const british = /british/i.test([typeof voice.description === 'string' ? voice.description : '', ...tags].join(' '))
            const label = british ? 'British' : voice.languageCode || voice.langCode || ''
            voices.set(voice.voiceId, {
                id: voice.voiceId,
                name: `${voice.displayName}${label ? ` (${label})` : ''}`,
                category: voice.source || 'Inworld'
            })
        }
        cursor = typeof page.nextPageToken === 'string' ? page.nextPageToken : ''
        if (cursor && seenCursors.has(cursor)) throw new Error('Inworld voice catalogue pagination did not advance.')
        if (cursor) seenCursors.add(cursor)
    } while (cursor)
    return [...voices.values()]
}
