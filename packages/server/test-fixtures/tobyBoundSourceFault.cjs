// Fault injection around the actual File loader, confined to the private test directory.
const fs = require('node:fs')
const path = require('node:path')
const entry = require.resolve('flowise-components')
const NativeFile = require(path.resolve(path.dirname(entry), '../nodes/documentloaders/File/File.js')).nodeClass
class TobySourceFault {
    async init(data, input, options) {
        const native = new NativeFile()
        if (global.__tobyBoundSourceFault === 'loader') {
            return native.init({ ...data, inputs: { txtFile: 'FILE-STORAGE::["missing-source.txt"]' } }, input, options)
        }
        if (global.__tobyBoundSourceFault === 'readback') {
            const [name] = JSON.parse(data.inputs.txtFile.slice('FILE-STORAGE::'.length))
            fs.appendFileSync(path.join(process.env.BLOB_STORAGE_PATH, options.orgId, options.chatflowid, options.chatId, name), '\n')
        }
        return native.init(data, input, options)
    }
}
module.exports = { nodeClass: TobySourceFault }
