import { convertTextToSpeechStream, ICommonObject, IServerSideEventStreamer } from 'flowise-components'
import logger from './logger'

export const generateTTSForResponseStream = async (
    responseText: string,
    textToSpeechConfig: string | undefined,
    options: ICommonObject,
    chatId: string,
    chatMessageId: string,
    sseStreamer: IServerSideEventStreamer,
    abortController?: AbortController
): Promise<void> => {
    const ttsAbortController = abortController || new AbortController()
    try {
        if (!textToSpeechConfig) return
        const config = typeof textToSpeechConfig === 'string' ? JSON.parse(textToSpeechConfig) : textToSpeechConfig

        let activeProviderConfig = null
        for (const providerKey in config) {
            const provider = config[providerKey]
            if (provider && provider.status === true) {
                activeProviderConfig = {
                    name: providerKey,
                    credentialId: provider.credentialId,
                    voice: provider.voice,
                    model: provider.model,
                    instruction: provider.instruction,
                    deliveryMode: provider.deliveryMode,
                    speakingRate: provider.speakingRate
                }
                break
            }
        }

        if (!activeProviderConfig) return

        await convertTextToSpeechStream(
            responseText,
            activeProviderConfig,
            options,
            ttsAbortController,
            (format: string) => {
                sseStreamer.streamTTSStartEvent(chatId, chatMessageId, format)
            },
            (chunk: Buffer) => {
                const audioBase64 = chunk.toString('base64')
                sseStreamer.streamTTSDataEvent(chatId, chatMessageId, audioBase64)
            },
            () => {
                sseStreamer.streamTTSEndEvent(chatId, chatMessageId)
            }
        )
    } catch {
        if (!ttsAbortController.signal.aborted) {
            logger.error('[server]: TTS streaming failed')
            sseStreamer.streamCustomEvent(chatId, 'tts_error', { chatMessageId, error: 'Speech is unavailable right now.' })
        }
        // A speech failure must never roll back a completed textual prediction or look like successful audio.
        sseStreamer.streamCustomEvent(chatId, 'tts_abort', { chatMessageId })
    }
}
