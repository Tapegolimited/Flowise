jest.mock('flowise-components', () => ({ validateMimeTypeAndExtensionMatch: jest.fn(), addArrayFilesToStorage: jest.fn() }))
import { decodeTobyBoundSourceUpload, getTobyBoundSourceUpload } from './tobyBoundSourceFile'

const text = 'TOBY SOURCE PACK\nQuestion: café and meiosis 🧬\nAnswer: chromosome number halves.\n'
const upload = {
    name: 'marked-test-result.txt',
    type: 'file:full',
    mime: 'text/plain',
    data: 'data:text/plain;base64,' + Buffer.from(text).toString('base64')
}

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
