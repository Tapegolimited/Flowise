/* Compiled Flowise + real LangChain/Google SDK, intercepted local HTTP only. No credential or remote prediction. */
const assert = require('node:assert/strict')
const {
    ChatGoogleGenerativeAI
} = require('../packages/components/dist/nodes/chatmodels/ChatGoogleGenerativeAI/FlowiseChatGoogleGenerativeAI.js')
const { HumanMessage, SystemMessage } = require('@langchain/core/messages')
const originalFetch = global.fetch
let checks = 0
const check = (fn) => {
    fn()
    checks++
}
const budget = { contextWindowTokens: 1000, marginTokens: 100, timeoutMs: 1000 }
const messages = () => [
    new SystemMessage('Synthetic tutor system.'),
    new HumanMessage('Synthetic history and full source questions/answers.')
]

async function run(enabled, streaming, count) {
    const bodies = []
    global.fetch = async (url, init) => {
        bodies.push({ url: String(url), body: JSON.parse(init.body) })
        if (String(url).includes(':countTokens'))
            return new Response(JSON.stringify({ totalTokens: count }), { headers: { 'Content-Type': 'application/json' } })
        const result = {
            candidates: [{ content: { role: 'model', parts: [{ text: 'Synthetic tutor answer.' }] } }],
            usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 2, totalTokenCount: 12 }
        }
        return new Response(streaming ? `data: ${JSON.stringify(result)}\n\n` : JSON.stringify(result), {
            headers: { 'Content-Type': streaming ? 'text/event-stream' : 'application/json' }
        })
    }
    const model = new ChatGoogleGenerativeAI(
        'synthetic-local-only',
        { apiKey: 'synthetic-key-not-a-credential', model: 'gemini-2.5-flash', maxOutputTokens: 200, streaming },
        enabled ? budget : undefined
    )
    const options = { tools: [{ functionDeclarations: [{ name: 'synthetic_lookup', description: 'Synthetic read-only lookup.' }] }] }
    let result, error
    try {
        result = await model._generate(messages(), options)
    } catch (caught) {
        error = caught
    }
    return { bodies, result, error }
}

;(async () => {
    for (const streaming of [false, true]) {
        const off = await run(false, streaming, 999999)
        check(() => assert.ifError(off.error))
        check(() => assert.equal(off.bodies.length, 1))
        check(() => assert.equal(off.result.generations[0].text, 'Synthetic tutor answer.'))
        const on = await run(true, streaming, 700)
        check(() => assert.ifError(on.error))
        check(() => assert.equal(on.bodies.length, 2))
        check(() => assert.ok(on.bodies[0].url.includes(':countTokens')))
        const { model: countedModel, ...countedRequest } = on.bodies[0].body.generateContentRequest
        check(() => assert.equal(countedModel, 'models/gemini-2.5-flash'))
        check(() => assert.deepEqual(countedRequest, on.bodies[1].body))
        check(() => assert.ok(countedRequest.systemInstruction && countedRequest.tools.length))
        check(() => assert.equal(on.result.generations[0].text, 'Synthetic tutor answer.'))
        const blocked = await run(true, streaming, 701)
        check(() => assert.equal(blocked.error.code, 'toby_context_budget_exceeded'))
        check(() => assert.equal(blocked.bodies.length, 1))
    }
    process.stdout.write(
        JSON.stringify({ pass: checks, node: process.version, compiledFlowise: true, realLangChainGoogleSDK: true, remoteCalls: 0 }) + '\n'
    )
})()
    .catch((error) => {
        process.stderr.write(String(error) + '\n')
        process.exitCode = 1
    })
    .finally(() => {
        global.fetch = originalFetch
    })
