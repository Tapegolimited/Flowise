import { readFileSync } from 'fs'
import { resolve } from 'path'
import { getPredictionChatId } from './predictionChatIdentity'

describe('opt-in provider chat identity', () => {
    const canonical = 'canonical-toby-session'
    const generated = 'a1884dcb-0e6d-40df-8c2f-9eecc416e17a'

    it.each([undefined, false, 'true', '1', 1, null, {}, []])('preserves canonical legacy memory/chat coupling for flag %p', (flag) => {
        const createId = jest.fn(() => generated)
        const input = { overrideConfig: { sessionId: canonical, ttIndependentChatId: flag } }
        expect(getPredictionChatId(input, createId)).toBe(canonical)
        expect(createId).not.toHaveBeenCalled()
        expect(input).not.toHaveProperty('chatId')
        expect(input.overrideConfig.sessionId).toBe(canonical)
    })

    it('keeps the existing no-session default generator', () => {
        const createId = jest.fn(() => generated)
        expect(getPredictionChatId({}, createId)).toBe(generated)
        expect(createId).toHaveBeenCalledTimes(1)
    })

    it.each(['real-provider-chat', canonical, ''])('never replaces a supplied durable/legacy chat ID %p', (chatId) => {
        const createId = jest.fn(() => generated)
        const input = { chatId, overrideConfig: { sessionId: canonical, ttIndependentChatId: true } }
        expect(getPredictionChatId(input, createId)).toBe(chatId)
        expect(createId).not.toHaveBeenCalled()
        expect(input.overrideConfig.sessionId).toBe(canonical)
    })

    it.each(['streaming controller then build', 'buffered build then queue retry'])('mints and shares only one provider UUID: %s', () => {
        const createId = jest.fn(() => generated)
        const input = { overrideConfig: { sessionId: canonical, ttIndependentChatId: true } }
        const first = getPredictionChatId(input, createId)
        const second = getPredictionChatId(input, createId)
        expect(first).toBe(generated)
        expect(second).toBe(first)
        expect(first).not.toBe(canonical)
        expect(createId).toHaveBeenCalledTimes(1)
        expect(input.overrideConfig.sessionId).toBe(canonical)
    })

    it('uses the existing provider UUID factory when opt-in is exactly true', () => {
        const input = { overrideConfig: { sessionId: canonical, ttIndependentChatId: true } }
        const id = getPredictionChatId(input)
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
        expect(getPredictionChatId(input)).toBe(id)
        expect(id).not.toBe(canonical)
    })

    it('wires both actual prediction paths to the same helper and leaves the canonical memory override intact', () => {
        const controller = readFileSync(resolve(__dirname, '../controllers/predictions/index.ts'), 'utf8')
        const builder = readFileSync(resolve(__dirname, 'buildChatflow.ts'), 'utf8')
        const memory = readFileSync(resolve(__dirname, 'index.ts'), 'utf8')
        expect(controller).toContain('chatId = getPredictionChatId(req.body)')
        expect(controller).toContain('req.body.chatId = chatId')
        expect(builder).toContain('const chatId = getPredictionChatId(incomingInput)')
        expect(controller).not.toContain('req.body.overrideConfig?.sessionId ?? uuidv4()')
        expect(builder).not.toContain('incomingInput.overrideConfig?.sessionId ?? uuidv4()')
        expect(memory).toContain('return incomingInput.overrideConfig.sessionId')
    })
})
