// Offline ending-node fixture for the actual native executeFlow test. No model/network.
class TobySourceProbe {
    constructor(options = {}) { this.sessionId = options.sessionId }
    async init() { return {} }
    async run(data, input, options) {
        global.__tobyBoundSourceProbe.push({ input, chatId: options.chatId, sessionId: this.sessionId })
        return { text: 'Offline source-file probe completed.' }
    }
}
module.exports = { nodeClass: TobySourceProbe }
