jest.mock('flowise-components', () => ({
    validateMimeTypeAndExtensionMatch: jest.fn((name: string, mime: string) => {
        if (!name.endsWith('.txt') || mime !== 'text/plain') throw Error('Native MIME/extension mismatch')
    }),
    addArrayFilesToStorage: jest.fn()
}))
const mockLoaderInit = jest.fn()
jest.mock(
    './tobyBoundSourceFile.loader.fixture',
    () => ({
        nodeClass: class {
            init = mockLoaderInit
        }
    }),
    { virtual: true }
)
import { createHash } from 'node:crypto'
import { addArrayFilesToStorage, validateMimeTypeAndExtensionMatch } from 'flowise-components'
import { decodeTobyBoundSourceUpload, getTobyBoundSourceUpload, prepareTobyBoundSourceUpload } from './tobyBoundSourceFile'

const text = 'TOBY SOURCE PACK\nQuestion: café and meiosis 🧬\nAnswer: chromosome number halves.\n'
const upload = {
    name: 'marked-test-result.txt',
    type: 'file:full',
    mime: 'text/plain',
    data: 'data:text/plain;base64,' + Buffer.from(text).toString('base64')
}
const readingText =
    '# Coastal change – café and Δ 🧭\n\n## Source and trust\n' +
    'Supporting learning evidence only.\n\n## The learner’s question\nWhy?\r\n  \t\n'
const readingUpload = { name: 'reading-material-context.md', type: 'file:full', mime: 'text/plain', data: readingText }

describe('server-bound UTF-8 source attachment contract', () => {
    it.each([undefined, false, 'true', '1', 1, null, {}, []])('keeps legacy full-file processing for non-boolean opt-in %p', (flag) => {
        expect(getTobyBoundSourceUpload({ overrideConfig: { ttBoundSourceUploads: flag }, uploads: [upload] })).toBeUndefined()
    })
    it('selects exactly the one bound source and preserves unrelated user uploads', () => {
        expect(
            getTobyBoundSourceUpload({
                overrideConfig: { ttBoundSourceUploads: true },
                uploads: [upload, { ...upload, name: 'notes.txt' }]
            })
        ).toBe(upload)
    })
    it.each([{ uploads: [] }, { uploads: [upload, upload] }, { uploads: [{ ...upload, name: 'notes.txt' }] }])(
        'rejects absent, duplicate or substituted sources',
        ({ uploads }) => {
            expect(() => getTobyBoundSourceUpload({ overrideConfig: { ttBoundSourceUploads: true }, uploads })).toThrow(
                'Invalid bound source upload'
            )
        }
    )
    it.each(['marked-test-result.txt', 'learning-material-and-mcq.txt'])('decodes exact UTF-8 source bytes for %s', (name) => {
        expect(decodeTobyBoundSourceUpload({ ...upload, name }).equals(Buffer.from(text))).toBe(true)
    })
    it('preserves CRLF and trailing whitespace within the source body', () => {
        const body = 'TOBY SOURCE PACK\nQuestion:\r\nCafé 🧬\r\nAnswer: halves.  \t\r\n'
        expect(
            decodeTobyBoundSourceUpload({ ...upload, data: 'data:text/plain;base64,' + Buffer.from(body).toString('base64') }).equals(
                Buffer.from(body)
            )
        ).toBe(true)
    })
    it('accepts the exact 196608-byte boundary without truncation', () => {
        const prefix = Buffer.from('TOBY SOURCE PACK\n')
        const bytes = Buffer.concat([prefix, Buffer.alloc(196608 - prefix.length, 'x')])
        expect(decodeTobyBoundSourceUpload({ ...upload, data: 'data:text/plain;base64,' + bytes.toString('base64') }).equals(bytes)).toBe(
            true
        )
    })
    it.each([
        { name: '../marked-test-result.txt' },
        { type: 'url' },
        { mime: 'text/html' },
        { data: text },
        { data: upload.data + '!' },
        { data: 'https://example.invalid/file.txt' },
        { data: 'data:text/plain;base64,' + Buffer.from('TOBY SOURCE PACK\n\0').toString('base64') },
        { data: 'data:text/plain;base64,' + Buffer.from([0xff, 0xfe]).toString('base64') },
        { data: 'data:text/plain;base64,' + Buffer.from('\uFEFF' + text).toString('base64') },
        { data: 'data:text/plain;base64,' },
        { data: 'data:text/plain;base64,' + Buffer.from('Not a source pack').toString('base64') }
    ])('rejects malformed or non-source bytes without substituting text', (change) => {
        expect(() => decodeTobyBoundSourceUpload({ ...upload, ...change })).toThrow('Invalid bound source upload')
    })
    it('rejects over-budget source data without truncation', () => {
        expect(() =>
            decodeTobyBoundSourceUpload({ ...upload, data: 'data:text/plain;base64,' + Buffer.alloc(196609).toString('base64') })
        ).toThrow('Bound source upload exceeds budget')
    })
})

describe('protected reading Markdown compatibility', () => {
    it.each([undefined, false, 'true', 1])('leaves ordinary reading uploads unchanged without strict opt-in %p', (flag) => {
        expect(getTobyBoundSourceUpload({ overrideConfig: { ttBoundSourceUploads: flag }, uploads: [readingUpload] })).toBeUndefined()
    })
    it('selects the exact reading source alongside an unrelated vision upload', () => {
        const image = { name: 'library-20-page-2.jpg', type: 'file', mime: 'image/jpeg', data: 'data:image/jpeg;base64,AAAA' }
        expect(getTobyBoundSourceUpload({ overrideConfig: { ttBoundSourceUploads: true }, uploads: [image, readingUpload] })).toBe(
            readingUpload
        )
        expect(image.data).toBe('data:image/jpeg;base64,AAAA')
    })
    it.each([
        { uploads: [] },
        { uploads: [readingUpload, readingUpload] },
        { uploads: [readingUpload, upload] },
        { uploads: [{ ...readingUpload, name: 'Reading-material-context.md' }] }
    ])('rejects missing, duplicate or ambiguous source selection', ({ uploads }) => {
        expect(() => getTobyBoundSourceUpload({ overrideConfig: { ttBoundSourceUploads: true }, uploads })).toThrow(
            'Invalid bound source upload'
        )
    })
    it('preserves the complete raw UTF-8 Markdown byte/hash identity', () => {
        const markdown = readingText + 'Δ note 🧭\n'.repeat(6000)
        const bytes = decodeTobyBoundSourceUpload({ ...readingUpload, data: markdown })
        expect(bytes.equals(Buffer.from(markdown, 'utf8'))).toBe(true)
        expect(createHash('sha256').update(bytes).digest('hex')).toBe(createHash('sha256').update(markdown, 'utf8').digest('hex'))
        expect(validateMimeTypeAndExtensionMatch).toHaveBeenLastCalledWith('reading-material-context.txt', 'text/plain')
    })
    it('accepts exactly 196608 UTF-8 bytes, including multibyte text, without truncation', () => {
        const header = Buffer.from(readingText)
        const bytes = Buffer.concat([header, Buffer.alloc(196608 - header.length, 'x')])
        expect(decodeTobyBoundSourceUpload({ ...readingUpload, data: bytes.toString('utf8') }).equals(bytes)).toBe(true)
        expect(() => decodeTobyBoundSourceUpload({ ...readingUpload, data: bytes.toString('utf8') + 'x' })).toThrow(
            'Bound source upload exceeds budget'
        )
    })
    it('preserves a 400-byte UTF-8 title and rejects the 401-byte neighbor', () => {
        const title = 'é'.repeat(200)
        const data = '# ' + title + '\n\n## Source and trust\nBody\n'
        expect(decodeTobyBoundSourceUpload({ ...readingUpload, data }).toString('utf8')).toBe(data)
        expect(() => decodeTobyBoundSourceUpload({ ...readingUpload, data: data.replace(title, title + 'x') })).toThrow(
            'Invalid bound source upload'
        )
    })
    it('enforces bytes rather than JavaScript string length', () => {
        const data = readingText + '🧭'.repeat(50000)
        expect(data.length).toBeLessThan(196608)
        expect(() => decodeTobyBoundSourceUpload({ ...readingUpload, data })).toThrow('Bound source upload exceeds budget')
    })
    it.each([
        { name: '../reading-material-context.md' },
        { name: 'reading-material-context.txt' },
        { type: 'file' },
        { type: 'url' },
        { mime: 'text/markdown' },
        { mime: 'text/html' },
        { data: undefined },
        { data: '' },
        { data: '\uFEFF' + readingText },
        { data: readingText + '\0' },
        { data: readingText + '\uD800' },
        { data: readingText.replace('# Coastal', '#Coastal') },
        { data: readingText.replace('## Source and trust', '## Unrelated header') },
        { data: readingText.replace('\n\n## Source and trust', '\r\n\r\n## Source and trust') },
        { data: 'data:text/plain;base64,' + Buffer.from(readingText).toString('base64') },
        { data: text },
        { data: 'https://example.invalid/source.md' }
    ])('rejects malformed or unsupported reading contracts without fallback', (change) => {
        expect(() => decodeTobyBoundSourceUpload({ ...readingUpload, ...change })).toThrow('Invalid bound source upload')
    })
    it.each(['marked-test-result.txt', 'learning-material-and-mcq.txt'])('does not admit raw Markdown through legacy source %s', (name) => {
        expect(() => decodeTobyBoundSourceUpload({ ...readingUpload, name })).toThrow('Invalid bound source upload')
    })
})

describe('bound native storage and exact loader readback', () => {
    const storage = new Map<string, Buffer>()
    const store = jest.mocked(addArrayFilesToStorage)
    const runtime = {
        orgId: 'owned-org',
        chatflowid: 'geography-flow',
        chatId: 'provider-chat-id',
        fileLoaderPath: './tobyBoundSourceFile.loader.fixture',
        updateUsage: jest.fn()
    }
    beforeEach(() => {
        jest.clearAllMocks()
        storage.clear()
        store.mockImplementation(async (_mime, bytes, name, names, ...scope) => {
            storage.set([...scope, name].join('/'), Buffer.from(bytes))
            names.push(name)
            return { path: 'FILE-STORAGE::' + JSON.stringify([name]), totalSize: bytes.length }
        })
        mockLoaderInit.mockImplementation(async (node, _input, options) => {
            const name = JSON.parse(node.inputs.txtFile.slice('FILE-STORAGE::'.length))[0]
            const bytes = storage.get([options.orgId, options.chatflowid, options.chatId, name].join('/'))
            return [{ pageContent: bytes?.toString('utf8') }]
        })
    })
    it.each([readingUpload, upload, { ...upload, name: 'learning-material-and-mcq.txt' }])(
        'persists and reloads the exact bytes through native text storage for $name',
        async (source) => {
            const bytes = decodeTobyBoundSourceUpload(source)
            const stem = source.name === readingUpload.name ? 'reading-material-context' : source.name.slice(0, -4)
            const name = `${stem}-${createHash('sha256').update(bytes).digest('hex')}.txt`
            const prepared = await prepareTobyBoundSourceUpload(source, runtime)
            expect(prepared.upload).toEqual({ type: 'stored-file:full', name, mime: 'text/plain' })
            expect(prepared.content).toBe(`<doc name='${source.name}'>${bytes.toString('utf8')}</doc>\n\n`)
            expect(storage.get(`owned-org/geography-flow/provider-chat-id/${name}`)).toEqual(bytes)
            expect(runtime.updateUsage).toHaveBeenCalledWith(bytes.length)
            expect(mockLoaderInit).toHaveBeenCalledWith(
                { inputs: { txtFile: 'FILE-STORAGE::' + JSON.stringify([name]) }, outputs: { output: 'document' } },
                '',
                { retrieveAttachmentChatId: true, orgId: 'owned-org', chatflowid: 'geography-flow', chatId: 'provider-chat-id' }
            )
            expect(await prepareTobyBoundSourceUpload(source, runtime)).toEqual(prepared)
        }
    )
    it('rejects malformed text before any storage, accounting or loader call', async () => {
        await expect(prepareTobyBoundSourceUpload({ ...readingUpload, data: readingText + '\uD800' }, runtime)).rejects.toThrow(
            'Invalid bound source upload'
        )
        expect(store).not.toHaveBeenCalled()
        expect(runtime.updateUsage).not.toHaveBeenCalled()
        expect(mockLoaderInit).not.toHaveBeenCalled()
    })
    it('propagates storage failure without publishing or loading replacement content', async () => {
        store.mockRejectedValueOnce(Error('Native storage unavailable'))
        await expect(prepareTobyBoundSourceUpload(readingUpload, runtime)).rejects.toThrow('Native storage unavailable')
        expect(mockLoaderInit).not.toHaveBeenCalled()
    })
    it('fails closed if loader bytes change or omit whitespace', async () => {
        mockLoaderInit.mockResolvedValueOnce([{ pageContent: readingText.trimEnd() }])
        await expect(prepareTobyBoundSourceUpload(readingUpload, runtime)).rejects.toThrow('Bound source readback changed')
    })
    it('propagates loader failure without falling back to base64 or an empty document', async () => {
        mockLoaderInit.mockRejectedValueOnce(Error('Native loader unavailable'))
        await expect(prepareTobyBoundSourceUpload(readingUpload, runtime)).rejects.toThrow('Native loader unavailable')
    })
})
