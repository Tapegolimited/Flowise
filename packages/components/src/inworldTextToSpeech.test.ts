import { getInworldVoices, projectInworldSpeechText, splitInworldSpeechText, streamInworldSpeech } from './inworldTextToSpeech'

const originalFetch = global.fetch
const mockFetch = jest.fn()
const encoder = new TextEncoder()
const config = { apiKey: 'synthetic-inworld-key', voice: 'catalogue-voice-id' }
const frame = (audio: string) => JSON.stringify({ result: { audioContent: Buffer.from(audio).toString('base64') } })
const streamed = (parts: string[]) =>
    new Response(
        new ReadableStream({
            start(controller) {
                for (const part of parts) controller.enqueue(encoder.encode(part))
                controller.close()
            }
        })
    )

beforeEach(() => {
    mockFetch.mockReset()
    global.fetch = mockFetch as typeof fetch
})
afterAll(() => {
    global.fetch = originalFetch
})

describe('Inworld speech transport', () => {
    it('delivers the first playable audio before EOF without artificial pacing or whole-response buffering', async () => {
        let controller: ReadableStreamDefaultController<Uint8Array>
        let receivedFirst!: () => void
        const first = new Promise<void>((resolve) => {
            receivedFirst = resolve
        })
        mockFetch.mockResolvedValue(
            new Response(
                new ReadableStream({
                    start(value) {
                        controller = value
                    }
                })
            )
        )
        const chunks: Buffer[] = []
        const start = jest.fn()
        const end = jest.fn()
        const abort = new AbortController()
        const playback = streamInworldSpeech(
            'A short explanation.',
            config,
            abort.signal,
            start,
            (chunk) => {
                chunks.push(chunk)
                receivedFirst()
            },
            end
        )
        controller!.enqueue(encoder.encode(`${frame('first')}\n`))
        await first
        expect(Buffer.concat(chunks).toString()).toBe('first')
        expect(end).not.toHaveBeenCalled()
        expect(start).toHaveBeenCalledTimes(1)
        controller!.enqueue(encoder.encode(`${frame('second')}\n`))
        controller!.close()
        await playback
        expect(Buffer.concat(chunks).toString()).toBe('firstsecond')
        expect(end).toHaveBeenCalledTimes(1)
        const [url, request] = mockFetch.mock.calls[0]
        expect(url).toBe('https://api.inworld.ai/tts/v1/voice:stream')
        expect(request.headers.Authorization).toBe('Basic synthetic-inworld-key')
        expect(request.signal).toBeInstanceOf(AbortSignal)
        expect(request.signal.aborted).toBe(false)
        expect(request.redirect).toBe('error')
        expect(JSON.parse(request.body)).toEqual({
            text: 'A short explanation.',
            voiceId: config.voice,
            modelId: 'inworld-tts-2-flash',
            language: 'en-GB',
            audioConfig: { audioEncoding: 'MP3', speakingRate: 1 }
        })
    })

    it('accepts fragmented NDJSON, multiple lines, CRLF, trailing metadata and an unterminated final line', async () => {
        const content = `${frame('one')}\r\n${frame('two')}\n{"result":{"usage":{"processedCharactersCount":0}}}`
        mockFetch.mockResolvedValue(streamed([content.slice(0, 7), content.slice(7, 31), content.slice(31)]))
        const chunks: Buffer[] = []
        await streamInworldSpeech(
            'Test.',
            { ...config, model: 'inworld-tts-2' },
            new AbortController().signal,
            jest.fn(),
            (chunk) => chunks.push(chunk),
            jest.fn()
        )
        expect(Buffer.concat(chunks).toString()).toBe('onetwo')
        expect(JSON.parse(mockFetch.mock.calls[0][1].body).modelId).toBe('inworld-tts-2')
    })

    it('reframes a large provider chunk into bounded gateway chunks without losing audio bytes', async () => {
        const audio = Buffer.alloc(1024 * 1024 + 19, 0x4d)
        mockFetch.mockResolvedValue(streamed([JSON.stringify({ result: { audioContent: audio.toString('base64') } }) + '\n']))
        const chunks: Buffer[] = []
        await streamInworldSpeech('Text', config, new AbortController().signal, jest.fn(), (chunk) => chunks.push(chunk), jest.fn())
        expect(chunks.length).toBeGreaterThan(1)
        expect(chunks.every((chunk) => chunk.length <= 32 * 1024)).toBe(true)
        expect(Buffer.concat(chunks).equals(audio)).toBe(true)
    })

    it('splits long input sequentially, preserving all text and one continuous start/end contract', async () => {
        const input = `${'First sentence. '.repeat(300)}${'x'.repeat(4200)}`
        mockFetch.mockImplementation(async (_url, request) => streamed([`${frame(JSON.parse(request.body).text)}\n`]))
        const chunks: Buffer[] = []
        const start = jest.fn()
        const end = jest.fn()
        await streamInworldSpeech(input, config, new AbortController().signal, start, (chunk) => chunks.push(chunk), end)
        const requests = mockFetch.mock.calls.map((call) => JSON.parse(call[1].body).text)
        expect(requests.length).toBeGreaterThan(1)
        expect(requests.every((text) => text.length <= 4000)).toBe(true)
        expect(requests.join('')).toBe(input)
        expect(Buffer.concat(chunks).toString()).toBe(input)
        expect(start).toHaveBeenCalledTimes(1)
        expect(end).toHaveBeenCalledTimes(1)
    })

    it('never cuts surrogate pairs or drops whitespace at request boundaries', () => {
        for (const input of ['a'.repeat(3999) + '😀' + 'b'.repeat(4100), 'One.\n'.repeat(2000), ' abc\t'.repeat(2000)]) {
            const parts = splitInworldSpeechText(input)
            expect(parts.join('')).toBe(input)
            expect(parts.every((part) => part.length <= 4000 && !/[\uD800-\uDBFF]$/.test(part))).toBe(true)
        }
    })

    it('preserves literal mathematical brackets and reads answer-side instruction tags as content, never steering', async () => {
        const source = 'Use [H+] and interval [0,1]. The text says [whisper] and [laugh].'
        mockFetch.mockResolvedValue(streamed([`${frame('audio')}\n`]))
        await streamInworldSpeech(source, config, new AbortController().signal, jest.fn(), jest.fn(), jest.fn())
        const body = JSON.parse(mockFetch.mock.calls[0][1].body)
        expect(body.text).toBe(
            'Use  open square bracket H+ close square bracket  and interval  open square bracket 0,1 close square bracket . The text says  open square bracket whisper close square bracket  and  open square bracket laugh close square bracket .'
        )
        expect(body.text).not.toMatch(/\[|\]/)
        expect(source).toContain('[H+]')
        expect(source).toContain('[whisper]')
        expect(body.deliveryMode).toBeUndefined()
    })

    it('reapplies only the configured TTS-2 direction on every bounded request and keeps it out of source content', async () => {
        const source = `${'Explain the next step clearly. '.repeat(300)} [0,1] 😀`
        mockFetch.mockImplementation(async () => streamed([`${frame('audio')}\n`]))
        const direction = 'Warm, [patient]\n and clear.'
        const prefix = '[Warm, patient and clear.] '
        await streamInworldSpeech(
            source,
            { ...config, model: 'inworld-tts-2', instruction: direction, deliveryMode: 'STABLE', speakingRate: '0.9' },
            new AbortController().signal,
            jest.fn(),
            jest.fn(),
            jest.fn()
        )
        const requests = mockFetch.mock.calls.map((call) => JSON.parse(call[1].body))
        expect(requests.length).toBeGreaterThan(1)
        expect(requests.every((body) => body.text.length <= 4000 && body.text.startsWith(prefix))).toBe(true)
        expect(requests.map((body) => body.text.slice(prefix.length)).join('')).toBe(projectInworldSpeechText(source))
        expect(requests.every((body) => body.deliveryMode === 'STABLE' && body.audioConfig.speakingRate === 0.9)).toBe(true)
        expect(source).not.toContain(prefix)
    })

    it.each([
        { instruction: 'Whisper' },
        { deliveryMode: 'STABLE' },
        { speakingRate: 0.4 },
        { speakingRate: 1.6 },
        { speakingRate: 'not-a-number' },
        { model: 'inworld-tts-2', deliveryMode: 'unsupported' },
        { model: 'inworld-tts-2', instruction: 'x'.repeat(501) }
    ])('rejects settings the selected model cannot honour rather than silently ignoring them: %j', async (settings) => {
        await expect(
            streamInworldSpeech('Text', { ...config, ...settings }, new AbortController().signal, jest.fn(), jest.fn(), jest.fn())
        ).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('does not contact Inworld for missing credentials, voice, unsupported model, empty text or an already aborted request', async () => {
        const aborted = new AbortController()
        aborted.abort()
        for (const [text, settings, signal] of [
            ['Text', { ...config, apiKey: '' }, new AbortController().signal],
            ['Text', { ...config, voice: '' }, new AbortController().signal],
            ['Text', { ...config, model: 'unreviewed-model' }, new AbortController().signal],
            [' ', config, new AbortController().signal],
            ['x'.repeat(40001), config, new AbortController().signal],
            ['Text', config, aborted.signal]
        ] as const) {
            await expect(streamInworldSpeech(text, settings, signal, jest.fn(), jest.fn(), jest.fn())).rejects.toThrow()
        }
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('sanitises HTTP errors and never retries or silently switches provider', async () => {
        mockFetch.mockResolvedValue(new Response(JSON.stringify({ error: config.apiKey }), { status: 401 }))
        const start = jest.fn()
        const end = jest.fn()
        await expect(streamInworldSpeech('Text', config, new AbortController().signal, start, jest.fn(), end)).rejects.toThrow(
            'Inworld speech request failed (HTTP 401).'
        )
        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(start).not.toHaveBeenCalled()
        expect(end).not.toHaveBeenCalled()
    })

    it.each([
        'not-json\n',
        '{"result":{"audioContent":"not base64"}}\n',
        '{"result":{"usage":{"processedCharactersCount":5}}}\n',
        'null\n'
    ])('rejects malformed or empty audio rather than reporting successful completion: %s', async (content) => {
        mockFetch.mockResolvedValue(streamed([content]))
        const end = jest.fn()
        await expect(streamInworldSpeech('Text', config, new AbortController().signal, jest.fn(), jest.fn(), end)).rejects.toThrow()
        expect(end).not.toHaveBeenCalled()
    })

    it('treats a midstream provider error as failure, preserves delivered audio and withholds successful end', async () => {
        mockFetch.mockResolvedValue(streamed([`${frame('partial')}\n{"error":{"code":8,"message":"${config.apiKey}"}}\n`]))
        const chunk = jest.fn()
        const end = jest.fn()
        await expect(streamInworldSpeech('Text', config, new AbortController().signal, jest.fn(), chunk, end)).rejects.toThrow(
            'Inworld speech generation failed (code 8).'
        )
        expect(chunk).toHaveBeenCalledWith(Buffer.from('partial'))
        expect(end).not.toHaveBeenCalled()
        expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('cancels a blocked response reader immediately and never dispatches subsequent text segments', async () => {
        const cancel = jest.fn()
        let requestStarted!: () => void
        const ready = new Promise<void>((resolve) => {
            requestStarted = resolve
        })
        mockFetch.mockImplementation(async () => {
            requestStarted()
            return new Response(new ReadableStream({ cancel }))
        })
        const abort = new AbortController()
        const end = jest.fn()
        const playback = streamInworldSpeech('x'.repeat(9000), config, abort.signal, jest.fn(), jest.fn(), end)
        await ready
        await Promise.resolve()
        abort.abort()
        await expect(playback).rejects.toThrow('aborted')
        expect(cancel).toHaveBeenCalledTimes(1)
        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(end).not.toHaveBeenCalled()
    })

    it('bounds the complete upstream request and reader without treating timeout as successful synthesis', async () => {
        const deadline = new AbortController()
        const timeoutSpy = jest.spyOn(AbortSignal, 'timeout').mockReturnValue(deadline.signal)
        const cancel = jest.fn()
        let requestStarted!: () => void
        const ready = new Promise<void>((resolve) => {
            requestStarted = resolve
        })
        mockFetch.mockImplementation(async () => {
            requestStarted()
            return new Response(new ReadableStream({ cancel }))
        })
        const end = jest.fn()
        try {
            const playback = streamInworldSpeech('Text', config, new AbortController().signal, jest.fn(), jest.fn(), end)
            await ready
            await Promise.resolve()
            deadline.abort()
            await expect(playback).rejects.toThrow('Inworld speech request timed out.')
            expect(timeoutSpy).toHaveBeenCalledWith(60000)
            expect(cancel).toHaveBeenCalledTimes(1)
            expect(end).not.toHaveBeenCalled()
        } finally {
            timeoutSpy.mockRestore()
        }
    })
})

describe('Inworld catalogue', () => {
    it('follows pagination, preserves exact voice IDs and de-duplicates results without inventing a voice', async () => {
        mockFetch.mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    voices: [
                        {
                            voiceId: 'workspace__actual-id',
                            displayName: 'Actual voice',
                            languageCode: 'en-GB',
                            tags: ['british'],
                            source: 'IVC'
                        }
                    ],
                    nextPageToken: 'opaque-cursor'
                })
            )
        )
        mockFetch.mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    voices: [
                        {
                            voiceId: 'workspace__actual-id',
                            displayName: 'Actual voice',
                            languageCode: 'en-GB',
                            tags: ['british'],
                            source: 'IVC'
                        },
                        { voiceId: 'Other', displayName: 'Other voice', languageCode: 'en-US', source: 'SYSTEM' }
                    ]
                })
            )
        )
        await expect(getInworldVoices(config.apiKey)).resolves.toEqual([
            { id: 'workspace__actual-id', name: 'Actual voice (British)', category: 'IVC' },
            { id: 'Other', name: 'Other voice (en-US)', category: 'SYSTEM' }
        ])
        const second = new URL(mockFetch.mock.calls[1][0])
        expect(second.origin + second.pathname).toBe('https://api.inworld.ai/voices/v1/voices')
        expect(second.searchParams.get('pageToken')).toBe('opaque-cursor')
        expect(second.searchParams.get('filter')).toBe('lang_code="en"')
    })

    it('rejects repeated pagination cursors and hides upstream authentication error details', async () => {
        mockFetch.mockImplementation(async () => new Response(JSON.stringify({ voices: [], nextPageToken: 'same-cursor' })))
        await expect(getInworldVoices(config.apiKey)).rejects.toThrow('pagination did not advance')
        mockFetch.mockReset().mockResolvedValue(new Response(config.apiKey, { status: 403 }))
        await expect(getInworldVoices(config.apiKey)).rejects.toThrow('Inworld speech request failed (HTTP 403).')
    })
})
