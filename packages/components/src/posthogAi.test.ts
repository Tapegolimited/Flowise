import { randomUUID } from 'node:crypto'
import type { BaseCallbackHandler } from '@langchain/core/callbacks/base'
import { AIMessage } from '@langchain/core/messages'
import type { ChatGeneration } from '@langchain/core/outputs'
import { observeAiHttp, observeChatModel, readAiParent, runWithAiTrace, signAiParent, type AiEvent } from './posthogAi'

const workflow = randomUUID()

describe('metadata-only AI Observability', () => {
    test('concurrent calls on a cached model isolate their traces and preserve provider usage', async () => {
        const model: { callbacks?: BaseCallbackHandler[] } = {}
        observeChatModel(model, 'openai', 'gpt-test')
        const callback = model.callbacks![0]
        const events: AiEvent[] = []
        const prompt = 'learner contents that should never leave Flowise'
        const send = (event: AiEvent) => events.push(event)
        async function predict(delay: number, tokens: number) {
            return runWithAiTrace(send, workflow, 1, 'prediction', undefined, undefined, async () => {
                const id = randomUUID()
                await callback.handleChatModelStart?.({ lc: 1, type: 'constructor', id: ['SyntheticModel'], kwargs: {} }, [], id)
                await new Promise((resolve) => setTimeout(resolve, delay))
                const message = new AIMessage({
                    content: prompt,
                    usage_metadata: { input_tokens: tokens, output_tokens: 2, total_tokens: tokens + 2 },
                    response_metadata: { model_name: 'gpt-test-returned', request: prompt }
                })
                const generation: ChatGeneration = { text: prompt, message }
                await callback.handleLLMEnd?.({ generations: [[generation]] }, id)
                return prompt
            })
        }
        expect(await Promise.all([predict(15, 11), predict(1, 22)])).toEqual([prompt, prompt])
        const roots = events.filter(({ event }) => event === '$ai_trace')
        const generations = events.filter(({ event }) => event === '$ai_generation')
        expect(roots).toHaveLength(2)
        expect(new Set(roots.map((event) => event.distinct_id)).size).toBe(2)
        expect(generations.map((event) => event.properties.$ai_input_tokens).sort()).toEqual([11, 22])
        generations.forEach(({ distinct_id, properties }) => {
            expect(roots.find((event) => event.distinct_id === distinct_id)?.uuid).toBe(properties.$ai_parent_id)
            expect(properties.$process_person_profile).toBe(false)
            expect(properties.$ai_model).toBe('gpt-test-returned')
        })
        expect(JSON.stringify(events)).not.toContain(prompt)
    })

    test('captures each Jev batch and classifies failures without recording error text', async () => {
        const events: AiEvent[] = []
        const failure = Object.assign(new Error('private exception message'), { response: { status: 429 } })
        const endpoint = 'https://openrouter.ai/api/alpha/decisions'
        const body = { model: 'typesafe/jev-1.14', input: 'hidden data' }
        await runWithAiTrace(
            (event) => events.push(event),
            workflow,
            1,
            'prediction',
            undefined,
            undefined,
            async () => {
                const response = { status: 200, data: JSON.stringify({ usage: { input_tokens: 10, output_tokens: 0, cost: 0.001 } }) }
                await expect(observeAiHttp(endpoint, 'POST', body, async () => response)).resolves.toBe(response)
                await expect(
                    observeAiHttp(endpoint, 'POST', body, async () => {
                        throw failure
                    })
                ).rejects.toBe(failure)
                await observeAiHttp('https://example.org/', 'POST', body, async () => response)
            }
        )
        expect(events.map((event) => event.event)).toEqual(['$ai_generation', '$ai_generation', '$ai_trace'])
        expect(events[0].properties).toMatchObject({ $ai_total_cost_usd: 0.001, $ai_output_tokens: 0, $ai_cost_passthrough: true })
        expect(events[1].properties).toMatchObject({ $ai_is_error: true, $ai_error: 'rate_limited' })
        expect(events[1].properties).not.toHaveProperty('$ai_input_tokens')
        expect(JSON.stringify(events)).not.toMatch(/private exception|hidden data/)
    })

    test('rejects an unrelated or invalid parent and isolates exporter failures', async () => {
        const secret = 'synthetic-secret-with-32-characters'
        const parent = { traceId: randomUUID(), spanId: randomUUID() }
        const header = signAiParent(parent, secret, workflow)
        expect(readAiParent(header, secret, workflow)).toEqual(parent)
        expect(readAiParent(header, secret, randomUUID())).toBeUndefined()
        expect(readAiParent(header.slice(0, -1), secret, workflow)).toBeUndefined()
        expect(readAiParent(header, 'a different signing key also 32 characters long', workflow)).toBeUndefined()
        await expect(
            runWithAiTrace(
                () => {
                    throw new Error('offline')
                },
                workflow,
                1,
                'prediction',
                parent,
                undefined,
                async () => 7
            )
        ).resolves.toBe(7)
    })
})
