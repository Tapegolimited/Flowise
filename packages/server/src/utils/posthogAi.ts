import type { IChatFlow } from '../Interface'
import { AiEvent, AiParent, runWithAiTrace } from 'flowise-components'
import logger from './logger'

const endpoint = 'https://eu.i.posthog.com/batch/'
const queueLimit = 1024
const batchSize = 50
const queue: AiEvent[] = []
let sending: Promise<void> | undefined
let flushTimer: ReturnType<typeof setTimeout> | undefined
let lastWarning = 0
let projectToken: string | undefined

function warn() {
    const now = Date.now()
    if (now - lastWarning > 60_000) {
        lastWarning = now
        logger.warn('[PostHog AI] event delivery unavailable or queue full')
    }
}

export function flushPostHogAi(): Promise<void> {
    if (flushTimer) clearTimeout(flushTimer)
    flushTimer = undefined
    if (sending) return sending
    if (!queue.length) return Promise.resolve()
    sending = (async () => {
        while (queue.length) {
            const batch = queue.splice(0, batchSize)
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ api_key: projectToken, batch }),
                    signal: AbortSignal.timeout(1500),
                    redirect: 'error'
                })
                if (!response.ok) warn()
                await response.body?.cancel()
            } catch {
                warn()
            }
        }
    })().finally(() => {
        sending = undefined
        if (queue.length) void flushPostHogAi()
    })
    return sending
}

function enqueue(event: AiEvent) {
    if (queue.length >= queueLimit) {
        warn()
        return
    }
    queue.push(event)
    if (queue.length >= batchSize) {
        void flushPostHogAi()
    } else if (!flushTimer && !sending) {
        flushTimer = setTimeout(() => void flushPostHogAi(), 1000)
        flushTimer.unref()
    }
}

export function observeFlow<T>(
    flow: Pick<IChatFlow, 'id' | 'updatedDate'>,
    entry: 'prediction' | 'schedule' | 'text_to_speech',
    execute: () => Promise<T>,
    signal?: AbortSignal,
    parent?: AiParent
): Promise<T> {
    const ids = process.env.TT_POSTHOG_AI_FLOWS?.split(',').map((id) => id.trim())
    if (!ids?.includes('*') && !ids?.includes(flow.id)) return execute()
    const key = process.env.TT_POSTHOG_AI_PROJECT_TOKEN
    if (!key || !/^phc_[A-Za-z0-9]+$/.test(key)) {
        warn()
        return execute()
    }
    projectToken = key
    const revision = new Date(flow.updatedDate).getTime()
    const version = Number.isFinite(revision) ? revision : 0
    const workflow = flow.id
    return runWithAiTrace(enqueue, workflow, version, entry, parent, signal, execute, (response) => {
        const result = response as { agentFlowExecutedData?: Array<{ status?: unknown }>; action?: unknown } | null
        const statuses = Array.isArray(result?.agentFlowExecutedData) ? result.agentFlowExecutedData.map((step) => step?.status) : []
        if (statuses.includes('ERROR')) return 'error'
        if (statuses.includes('STOPPED') && result?.action) return 'paused'
        if (statuses.includes('STOPPED')) return 'cancelled'
        return 'success'
    })
}
