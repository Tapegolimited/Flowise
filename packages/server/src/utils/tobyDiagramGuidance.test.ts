import { replaceInputsWithConfig, resolveVariables } from './index'
import type { INodeData, IVariableOverride } from '../Interface'

// Isolate logging/storage and the components entry's browser transports. The
// resolver, native API filtering and lodash implementation are actual imports.
jest.mock('./logger', () => ({ __esModule: true, default: { info: jest.fn(), error: jest.fn() } }))
jest.mock('flowise-components', () => ({
    handleEscapeCharacters: (value: unknown) => value,
    convertChatHistoryToText: () => ''
}))

const name = 'tobyDiagramAuthoringGuidance'
const slot = `{{$vars.${name}}}`
const guidance = 'Use only the reviewed trapezium template when it helps the learner.'
const denial = 'Diagram authoring is unavailable for this request. Continue with ordinary tutoring prose.'
const permission: IVariableOverride = { id: 'offline-guide', name, enabled: true, type: 'runtime' }
const flowConfig = { chatflowId: 'offline-flow', chatId: 'isolated-chat', sessionId: 'isolated-session', chatHistory: [] }
const prompt = `Existing teaching policy.\n${slot}\nOther slot: {{$vars.unrelatedRuntime}}\nFlow: {{$flow.sessionId}}`

const node = (value: unknown = prompt, vars?: unknown, acceptVariable = true): INodeData =>
    ({
        id: 'offline-agent',
        label: 'Tool Agent',
        inputParams: [{ name: 'systemMessage', acceptVariable }],
        inputs: { systemMessage: value, ...(vars === undefined ? {} : { vars }) }
    } as unknown as INodeData)

const resolve = (data: INodeData, permissions: IVariableOverride[] = [permission], config = flowConfig) =>
    resolveVariables(data, [], 'Offline learner question', [], config, undefined, [], permissions)

describe('real Flowise resolver: protected diagram guidance without a database global', () => {
    it.each([true, false])('resolves API-filtered guidance with acceptVariable=%p', async (acceptVariable) => {
        const input = { vars: { [name]: guidance, unpermittedCallerClaim: 'unsafe' } }
        const filtered = replaceInputsWithConfig(node(prompt, undefined, acceptVariable), input, {}, [permission])
        expect(Object.keys(filtered.inputs!.vars)).toEqual([name])
        const result = await resolve(filtered)
        expect(result.inputs!.systemMessage).toBe(prompt.replace(slot, guidance).replace('{{$flow.sessionId}}', 'isolated-session'))
        expect(result.inputs!.systemMessage).toContain('{{$vars.unrelatedRuntime}}')
        expect(filtered.inputs!.systemMessage).toBe(prompt)
        expect(flowConfig).not.toHaveProperty('vars')
    })

    it('resolves array prompt values through the same native path', async () => {
        const result = await resolve(node([`First ${slot}`, `Second ${slot}`], { [name]: guidance }))
        expect(result.inputs!.systemMessage).toEqual([`First ${guidance}`, `Second ${guidance}`])
    })

    it.each([denial, ''])('uses current server denial/empty guidance without replaying an earlier positive value: %p', async (value) => {
        const first = await resolve(node(slot, { [name]: guidance }))
        expect(first.inputs!.systemMessage).toBe(guidance)
        const result = await resolve(node(slot, { [name]: value }))
        expect(result.inputs!.systemMessage).toBe(value)
    })

    it.each([
        ['missing permission', []],
        ['disabled permission', [{ ...permission, enabled: false }]],
        ['static permission', [{ ...permission, type: 'static' }]],
        ['another permitted variable', [{ ...permission, name: 'unrelatedRuntime' }]],
        ['truthy enabled value', [{ ...permission, enabled: 'true' }]]
    ])('leaves the slot unresolved with %s', async (_label, permissions) => {
        const result = await resolve(node(slot, { [name]: guidance }), permissions as IVariableOverride[])
        expect(result.inputs!.systemMessage).toBe(slot)
    })

    it.each([undefined, null, 3, true, {}, [], { nested: guidance }])('rejects a missing/non-string guidance value: %p', async (value) => {
        const result = await resolve(node(slot, { [name]: value }))
        expect(result.inputs!.systemMessage).toBe(slot)
    })

    it.each([undefined, null, '', 4, []])('leaves an absent/malformed node vars container unchanged: %p', async (vars) => {
        const result = await resolve(node(slot, vars))
        expect(result.inputs!.systemMessage).toBe(slot)
    })

    it('does not activate even another allowlisted node-local runtime variable', async () => {
        const otherPermission = { ...permission, id: 'other', name: 'unrelatedRuntime' }
        const input = { vars: { [name]: guidance, unrelatedRuntime: 'must stay unchanged', unknown: 'removed' } }
        const filtered = replaceInputsWithConfig(node(), input, {}, [permission, otherPermission])
        const result = await resolve(filtered, [permission, otherPermission])
        expect(result.inputs!.systemMessage).toContain('{{$vars.unrelatedRuntime}}')
        expect(result.inputs!.systemMessage).not.toContain('must stay unchanged')
        expect(filtered.inputs!.vars).not.toHaveProperty('unknown')
    })

    it('retains existing explicit flowConfig vars behaviour', async () => {
        const otherPermission = { ...permission, id: 'other', name: 'unrelatedRuntime' }
        const config = { ...flowConfig, vars: { unrelatedRuntime: 'already supported' } }
        const result = await resolve(node(prompt, { [name]: guidance }), [permission, otherPermission], config)
        expect(result.inputs!.systemMessage).toContain('Other slot: already supported')
        expect(config.vars).toEqual({ unrelatedRuntime: 'already supported' })
    })

    it('cannot restore guidance removed by the actual disabled API filter', async () => {
        const disabled = { ...permission, enabled: false }
        const filtered = replaceInputsWithConfig(node(slot), { vars: { [name]: guidance } }, {}, [disabled])
        expect(filtered.inputs!.vars).toEqual({})
        const result = await resolve(filtered)
        expect(result.inputs!.systemMessage).toBe(slot)
    })
})
