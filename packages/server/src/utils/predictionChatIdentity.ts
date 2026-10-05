import { v4 as uuidv4 } from 'uuid'

interface PredictionChatIdentityInput {
    chatId?: string | null
    overrideConfig?: { sessionId?: string | null; ttIndependentChatId?: unknown }
}

/** Keep an explicitly requested provider chat identity separate from its memory key. */
export const getPredictionChatId = (input: PredictionChatIdentityInput, createId: () => string = uuidv4): string => {
    if (input.chatId !== undefined && input.chatId !== null) return input.chatId
    if (input.overrideConfig?.ttIndependentChatId === true) {
        // Memoize on this request: streaming, queue and build paths reuse one ID.
        input.chatId = createId()
        return input.chatId
    }
    // Preserve the existing API/Help/background contract unless explicitly enabled.
    return input.overrideConfig?.sessionId ?? createId()
}
