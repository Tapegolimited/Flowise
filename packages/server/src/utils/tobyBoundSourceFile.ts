import { createHash } from 'node:crypto'
import { IFileUpload, addArrayFilesToStorage, validateMimeTypeAndExtensionMatch } from 'flowise-components'
import { InternalFlowiseError } from '../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'

const sourceNames = ['marked-test-result.txt', 'learning-material-and-mcq.txt']

/** Server opt-in only. Native/browser full-file uploads keep their existing protocol. */
export const getTobyBoundSourceUpload = (input: {
    overrideConfig?: { ttBoundSourceUploads?: unknown }
    uploads?: IFileUpload[]
}): IFileUpload | undefined => {
    if (input.overrideConfig?.ttBoundSourceUploads !== true) return undefined
    const sources = (input.uploads ?? []).filter((upload) => sourceNames.includes(upload.name))
    if (sources.length !== 1) throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invalid bound source upload')
    return sources[0]
}

export const decodeTobyBoundSourceUpload = (upload: IFileUpload): Buffer => {
    const prefix = 'data:text/plain;base64,'
    if (
        !sourceNames.includes(upload.name) ||
        upload.type !== 'file:full' ||
        upload.mime !== 'text/plain' ||
        typeof upload.data !== 'string' ||
        !upload.data.startsWith(prefix)
    ) {
        throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invalid bound source upload')
    }
    const encoded = upload.data.slice(prefix.length)
    // Matches WordPress's existing maximum source-pack bound; never truncate.
    if (encoded.length > 4 * Math.ceil(196608 / 3)) {
        throw new InternalFlowiseError(StatusCodes.REQUEST_TOO_LONG, 'Bound source upload exceeds budget')
    }
    const bytes = Buffer.from(encoded, 'base64')
    if (
        bytes.length === 0 ||
        bytes.toString('base64') !== encoded ||
        !Buffer.from(bytes.toString('utf8'), 'utf8').equals(bytes) ||
        bytes.includes(0) ||
        !bytes.toString('utf8').startsWith('TOBY SOURCE PACK\n')
    ) {
        throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invalid bound source upload')
    }
    validateMimeTypeAndExtensionMatch(upload.name, upload.mime)
    return bytes
}

/** Native storage and File loader own both first-turn extraction and later history. */
export const prepareTobyBoundSourceUpload = async (
    upload: IFileUpload,
    runtime: {
        orgId: string
        chatflowid: string
        chatId: string
        fileLoaderPath: string
        updateUsage: (size: number) => Promise<void> | void
    }
): Promise<{ upload: IFileUpload; content: string }> => {
    const bytes = decodeTobyBoundSourceUpload(upload)
    // Versioned names cannot overwrite an earlier attachment in the same session.
    const name = `${upload.name.slice(0, -4)}-${createHash('sha256').update(bytes).digest('hex')}.txt`
    const names: string[] = []
    const stored = await addArrayFilesToStorage('text/plain', bytes, name, names, runtime.orgId, runtime.chatflowid, runtime.chatId)
    await runtime.updateUsage(stored.totalSize)
    const loaderModule = await import(runtime.fileLoaderPath)
    const loader = new loaderModule.nodeClass()
    const documents: { pageContent: string }[] = await loader.init(
        { inputs: { txtFile: stored.path }, outputs: { output: 'document' } },
        '',
        { retrieveAttachmentChatId: true, orgId: runtime.orgId, chatflowid: runtime.chatflowid, chatId: runtime.chatId }
    )
    const text = documents.map((document) => document.pageContent).join('\n')
    if (text !== bytes.toString('utf8') || names.length !== 1 || names[0] !== name) {
        throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Bound source readback changed')
    }
    return { upload: { type: 'stored-file:full', name, mime: 'text/plain' }, content: `<doc name='${upload.name}'>${text}</doc>\n\n` }
}
