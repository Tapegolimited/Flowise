import type { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import predictionsController from '../controllers/predictions'
import predictionsService from '../services/predictions'
import { getRunningExpressApp } from './getRunningExpressApp'
import { getPredictionChatId } from './predictionChatIdentity'

jest.mock('uuid', () => ({ v4: jest.fn(() => 'a1884dcb-0e6d-40df-8c2f-9eecc416e17a') }))
jest.mock('./rateLimit', () => ({ RateLimiterManager: {} }))
jest.mock('../services/chatflows', () => ({
    __esModule: true,
    default: {
        getChatflowById: jest.fn(async () => ({ id: 'offline-private-flow' })),
        checkIfChatflowIsValidForStreaming: jest.fn(async () => ({ isStreaming: true }))
    }
}))
jest.mock('./logger', () => ({ __esModule: true, default: { info: jest.fn() } }))
jest.mock('../services/predictions', () => ({ __esModule: true, default: { buildChatflow: jest.fn() } }))
jest.mock('./getRunningExpressApp', () => ({ getRunningExpressApp: jest.fn() }))

describe('actual prediction controller uses one request-scoped provider identity', () => {
    const canonical = 'canonical-toby-session'
    const generated = 'a1884dcb-0e6d-40df-8c2f-9eecc416e17a'

    it.each([true, false])('new independent chat: streaming=%p', async (streaming) => {
        jest.clearAllMocks()
        const input = { question: 'Offline fixture', streaming, overrideConfig: { sessionId: canonical, ttIndependentChatId: true } }
        const req = { params: { id: 'offline-private-flow' }, body: input, headers: {} } as unknown as Request
        const res = { setHeader: jest.fn(), flushHeaders: jest.fn(), json: jest.fn() } as unknown as Response
        const next = jest.fn() as NextFunction
        const streamer = {
            addExternalClient: jest.fn(),
            streamMetadataEvent: jest.fn(),
            streamErrorEvent: jest.fn(),
            removeClient: jest.fn()
        }
        ;(getRunningExpressApp as jest.Mock).mockReturnValue({ sseStreamer: streamer })
        ;(predictionsService.buildChatflow as jest.Mock).mockImplementation(async (request: Request) => ({
            // Same actual resolver used by utilBuildChatflow. No model or DB call.
            chatId: getPredictionChatId(request.body),
            sessionId: request.body.overrideConfig.sessionId
        }))
        await predictionsController.createPrediction(req, res, next)
        expect(next).not.toHaveBeenCalled()
        expect(uuidv4).toHaveBeenCalledTimes(1)
        expect(req.body.chatId).toBe(generated)
        expect(req.body.overrideConfig.sessionId).toBe(canonical)
        if (streaming) {
            expect(streamer.addExternalClient).toHaveBeenCalledWith(generated, res)
            expect(streamer.streamMetadataEvent).toHaveBeenCalledWith(generated, { chatId: generated, sessionId: canonical })
            expect(streamer.removeClient).toHaveBeenCalledWith(generated)
        } else {
            expect(res.json).toHaveBeenCalledWith({ chatId: generated, sessionId: canonical })
            expect(streamer.addExternalClient).not.toHaveBeenCalled()
        }
    })

    it.each([true, false])('existing binding equal to canonical remains unchanged: streaming=%p', async (streaming) => {
        jest.clearAllMocks()
        const req = {
            params: { id: 'offline-private-flow' },
            headers: {},
            body: {
                question: 'Offline fixture',
                streaming,
                chatId: canonical,
                overrideConfig: { sessionId: canonical, ttIndependentChatId: true }
            }
        } as unknown as Request
        const res = { setHeader: jest.fn(), flushHeaders: jest.fn(), json: jest.fn() } as unknown as Response
        const next = jest.fn() as NextFunction
        const streamer = {
            addExternalClient: jest.fn(),
            streamMetadataEvent: jest.fn(),
            streamErrorEvent: jest.fn(),
            removeClient: jest.fn()
        }
        ;(getRunningExpressApp as jest.Mock).mockReturnValue({ sseStreamer: streamer })
        ;(predictionsService.buildChatflow as jest.Mock).mockImplementation(async (request: Request) => ({
            chatId: getPredictionChatId(request.body),
            sessionId: request.body.overrideConfig.sessionId
        }))
        await predictionsController.createPrediction(req, res, next)
        expect(next).not.toHaveBeenCalled()
        expect(uuidv4).not.toHaveBeenCalled()
        expect(req.body.chatId).toBe(canonical)
        expect(req.body.overrideConfig.sessionId).toBe(canonical)
    })
})
