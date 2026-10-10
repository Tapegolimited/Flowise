import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import vm from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { parseDiagramDescriptor } from '../diagram-descriptor.generated.mjs'
import {
    readProtectedVisualCapability,
    effectiveCapabilityRegistry,
    validateDiagramForPublication,
    validateDiagramDocument
} from '../visual-capability.mjs'
import { CAPABILITY_REGISTRY, buildCandidatePlannerPrompt } from '../candidate-planner.mjs'
import { compilePlan } from '../compiler.mjs'
import { extendCurrentBuilder, extendCurrentQueueTool, extendCurrentParent } from '../diagram-candidate-extension.mjs'
import { bundleModules } from '../bundle.mjs'

test('formatted module closure compiles as a Flowise function without imports or file reads', () => {
    const code = bundleModules(
        [
            'diagram-descriptor.generated.mjs',
            'visual-capability.mjs',
            'candidate-planner.mjs',
            'candidate-planner-v2.mjs',
            'compile-candidate.mjs',
            '../toby-youtube-v1/video-brief.mjs',
            'compiler.mjs',
            'provider.mjs'
        ],
        { CAPABILITY_REGISTRY }
    )
    assert.doesNotMatch(code, /^import\s/m)
    assert.doesNotMatch(code, /import\.meta|\breadFileSync\(/)
    const context = vm.createContext({})
    new vm.Script('(function(){' + code + '; return typeof compilePlan})()').runInContext(context)
})

const read = (url) => JSON.parse(readFileSync(url, 'utf8'))
const catalogue = read(new URL('../catalogue.json', import.meta.url))
const benchmark = read(new URL('./visual-routing-benchmark.json', import.meta.url))
const fixtures = read(new URL('./diagram-conformance-fixtures.json', import.meta.url))
const capability = (ids = ['math.area.rectangle'], mode = 'teach_me', state = 'none') => ({
    schemaVersion: 1,
    generationEnabled: true,
    allowedTemplateIds: ids,
    mode,
    assessmentState: state
})
const rectangle = { v: 1, t: 'math.area.rectangle@1.0.0', p: { w: 4, h: 3, u: 'cm' } }
function planFor(row) {
    const playbook = catalogue.playbookCatalogue.find((p) => p.id === 'explain_and_check')
    const formation = catalogue.formationCatalogue.find((f) => f.playbookId === playbook.id)
    const block = {
        id: 'block_1',
        capabilityId: row.expectedCapabilityId,
        representationVariant: row.representationVariant,
        purpose: row.request,
        learnerAction: 'Inspect supplied evidence and explain your reasoning.',
        resourceIds: row.expectedCapabilityId === 'prose' ? [] : ['source_1'],
        anchor: {
            whatToNotice: 'Inspect the stated structure or supplied values.',
            connectionToExplanation: 'Connect the supplied evidence to the learner objective.'
        },
        fallback: { capabilityId: 'prose', condition: 'Use an equivalent concise explanation if the specialised visual is unavailable.' },
        assessmentMode: row.expectedCapabilityId === 'question' ? 'explicit_submit' : 'none',
        subtopicId: row.canonicalSubtopicId
    }
    const context = {
        objective: row.request,
        outcome: 'Explain using the supplied evidence.',
        substantiveContent: [{ source_id: 'source_1', text: 'Synthetic bounded supplied teaching content.' }],
        subjectId: row.subjectId,
        mode: row.canonicalMode,
        assessmentIntent: row.assessmentIntent,
        contextSignals: { curriculum: { tier: row.curriculumTier } },
        protectedVisualCapability: {
            ...capability(row.reviewedTemplateIds, row.canonicalMode, row.assessmentState),
            generationEnabled: row.generationEnabled
        },
        canonicalSubtopicId: row.canonicalSubtopicId
    }
    // Explicit simulated authority is independent of model curriculum suggestions;
    // this local-only number is never read as a production curriculum identifier.
    if (row.id === 'combined-foundation')
        context.protectedVisualCapability.curriculumScope = {
            subjectId: 'subj-combined-sci',
            tier: 'Foundation',
            strand: 'biology',
            canonicalSubtopicId: 123
        }
    return {
        context,
        plan: {
            version: 'agent-owned-planner.v1',
            title: 'Synthetic visual routing fixture',
            description: 'Contract check, not subject-reviewed learning material.',
            choice: {
                playbookId: playbook.id,
                formationId: formation.id,
                contract_version: formation.version,
                rationale: 'Use the owned representation that serves the supplied reasoning objective.',
                requestedTypeStatus: 'absent'
            },
            subjectVisualNeed: {
                disciplinaryDemand: 'Use the supplied subject demand.',
                whatToNotice: 'Inspect the bounded supplied feature.',
                representationReason: 'Only add a representation when it explains a concrete relationship.'
            },
            sections: formation.requiredSectionSequence.map((role, i) => ({
                id: 'section_' + i,
                role,
                title: 'Section ' + i,
                purpose: row.request,
                proseFocus: 'Preserve the given scope and epistemic limits.',
                transitionPurpose: 'Connect the evidence to the next reasoning step.',
                semanticStyle: 'concept',
                blocks: i === 0 ? [block] : []
            })),
            resources:
                row.expectedCapabilityId === 'prose'
                    ? []
                    : [
                          {
                              id: 'source_1',
                              kind: 'source',
                              purpose: 'Use supplied content.',
                              acquisitionBrief: 'Reuse exact supplied content.',
                              dataNeeds: [],
                              providedEvidenceRefs: ['source_1'],
                              illustrativeAllowed: false,
                              required: true
                          }
                      ],
            contractChangeNotes: []
        }
    }
}

test('frozen routing benchmark keeps specialist owners, sufficient prose and mode/assessment gates', () => {
    assert.equal(benchmark.providerPredictions, false)
    assert.equal(benchmark.cases.length, 26)
    for (const row of benchmark.cases) {
        const { context, plan } = planFor(row)
        const resolution = row.canonicalSubtopicId
            ? {
                  verified: true,
                  state: 'verified_exact',
                  subtopic_id: row.canonicalSubtopicId,
                  subject_id: row.subjectId,
                  resolution_hash: 'synthetic-local-resolution'
              }
            : {}
        const out = compilePlan(plan, { context, catalogue, resolution })
        assert.equal(out.publicationAllowed, row.expectedPublication, row.id + ': ' + out.validation.errors.join(';'))
        assert.equal(out.plan.sections[0].blocks[0].capabilityId, row.expectedCapabilityId, 'Compiler must preserve the educational owner')
    }
})
test('effective prompt/schema lists only ready chart4/relationship5 and approved subject diagram families', () => {
    const context = {
        objective: 'Inspect the supplied rectangle.',
        subjectId: 'subj-higher-maths',
        protectedVisualCapability: capability()
    }
    const prompt = buildCandidatePlannerPrompt({ context, ...catalogue })
    const data = JSON.parse(prompt.user)
    assert.deepEqual(data.capabilities.find((c) => c.block === 'chart').families, ['bar', 'line', 'area', 'pie'])
    assert.equal(data.capabilities.find((c) => c.block === 'learning_visual').families.length, 5)
    assert.deepEqual(data.capabilities.find((c) => c.block === 'diagram').families, ['math.area.rectangle'])
    assert.ok(
        prompt.responseSchema.properties.sections.items.properties.blocks.items.properties.capabilityId.enum.includes('template_diagram')
    )
    for (const protectedVisualCapability of [
        undefined,
        { ...capability(), generationEnabled: false },
        capability([], 'teach_me'),
        capability(['math.area.rectangle'], 'teach_me', 'active')
    ]) {
        const off = buildCandidatePlannerPrompt({ context: { ...context, protectedVisualCapability }, ...catalogue })
        assert.ok(!JSON.parse(off.user).capabilities.some((c) => c.block === 'diagram'))
        assert.ok(
            !off.responseSchema.properties.sections.items.properties.blocks.items.properties.capabilityId.enum.includes('template_diagram')
        )
    }
    assert.ok(
        !effectiveCapabilityRegistry(CAPABILITY_REGISTRY, { ...context, subjectId: 'subj-geography' }).capabilities.some(
            (c) => c.blockType === 'diagram'
        )
    )
    assert.equal(readProtectedVisualCapability(capability(['math.area.rectangle'], 'revision')).generationEnabled, true)
})
test('unsupported rich charts and unapproved energy_flow cannot enter a new plan', () => {
    const row = benchmark.cases.find((c) => c.id === 'data-owner')
    const fixture = planFor(row)
    fixture.plan.sections[0].blocks[0].representationVariant = 'sankey'
    assert.equal(compilePlan(fixture.plan, { context: fixture.context, catalogue }).publicationAllowed, false)
    fixture.plan.sections[0].blocks[0].capabilityId = 'relationship_visual'
    fixture.plan.sections[0].blocks[0].representationVariant = 'energy_flow'
    assert.equal(compilePlan(fixture.plan, { context: fixture.context, catalogue }).publicationAllowed, false)
})
test('Combined Science requires protected Foundation scope and exactly its canonical strand', () => {
    const cell = { v: 1, t: 'biology.cell.animal@1.0.0', p: {} }
    const scope = { subjectId: 'subj-combined-sci', tier: 'Foundation', strand: 'biology', canonicalSubtopicId: 123 }
    const protectedValue = { ...capability(['biology.cell.animal', 'chemistry.particle.states']), curriculumScope: scope }
    assert.doesNotThrow(() => validateDiagramForPublication(cell, protectedValue, 'subj-combined-sci'))
    assert.deepEqual(
        effectiveCapabilityRegistry(CAPABILITY_REGISTRY, {
            subjectId: 'subj-combined-sci',
            protectedVisualCapability: protectedValue
        }).capabilities.find((c) => c.blockType === 'diagram').families,
        ['biology.cell.animal']
    )
    assert.throws(() =>
        validateDiagramForPublication({ v: 1, t: 'chemistry.particle.states@1.0.0', p: { s: 'gas' } }, protectedValue, 'subj-combined-sci')
    )
    for (const curriculumScope of [
        null,
        { ...scope, tier: 'Higher' },
        { ...scope, canonicalSubtopicId: '123' },
        { ...scope, canonicalSubtopicId: 0 },
        { ...scope, subjectId: 'subj-biology' },
        { ...scope, strand: 'general' }
    ]) {
        assert.throws(() => validateDiagramForPublication(cell, { ...protectedValue, curriculumScope }, 'subj-combined-sci'))
    }
    assert.throws(() => validateDiagramForPublication(cell, { ...protectedValue, assessmentState: 'active' }, 'subj-combined-sci'))
})
test('shared descriptor fixtures canonicalise; strict negative cases match PHP and TypeScript', () => {
    const negatives = [
        { ...rectangle, view: null },
        { ...rectangle, v: '1' },
        { ...rectangle, title: 'caller title' },
        { ...rectangle, p: { ...rectangle.p, w: true } },
        { ...rectangle, p: { ...rectangle.p, sh: 'pattern' } },
        { v: 1, t: 'math.area.triangle@1.0.0', p: { b: 3, h: 4, u: 'cm', hp: 'outside', sh: 'none' } },
        { v: 1, t: 'chemistry.particle.states@1.0.0', p: { s: 'gas', c: 'gas' } },
        { v: 1, t: 'biology.cell.animal@1.0.0', p: { l: null } },
        { v: 1, t: 'biology.cell.animal@1.0.0', p: { hl: null } },
        ...[' Box', 'Box ', '\u00a0Box', 'Box\u2003', '\ufeffBox', '\u00a0', 'file:///tmp/x', '%BLOCK_1%', '🧪'.repeat(25)].map((obj) => ({
            v: 1,
            t: 'physics.forces.single_object@1.0.0',
            p: { obj, f: [{ d: 'up', l: 'Support' }] }
        })),
        { v: 1, t: 'physics.forces.single_object@1.0.0', p: { obj: '🧪'.repeat(24), f: [{ d: 'up', l: 'Support' }] } }
    ]
    const inputs = [...fixtures.cases.map((c) => c.input), ...negatives]
    const expected = inputs.map((input) => {
        try {
            return { accepted: true, canonical: parseDiagramDescriptor(input) }
        } catch {
            return { accepted: false }
        }
    })
    for (const fixture of fixtures.cases) assert.doesNotThrow(() => parseDiagramDescriptor(fixture.input), fixture.name)
    if (process.env.TOBY_WORDPRESS_SOURCE) {
        const actual = JSON.parse(
            execFileSync('php', [process.env.TOBY_WORDPRESS_SOURCE + '/tests/toby-diagram-contract.php', '--normalize'], {
                input: JSON.stringify(inputs),
                encoding: 'utf8'
            })
        )
        assert.deepEqual(actual, expected)
    }
})
test('publication checks generation, subject, Homework variants, descriptor max2 and placeholders', () => {
    const descriptor = validateDiagramForPublication(rectangle, capability(), 'subj-higher-maths')
    assert.equal(descriptor.variant, 'hint')
    assert.throws(() => validateDiagramForPublication(rectangle, null, 'subj-higher-maths'))
    assert.throws(() => validateDiagramForPublication(rectangle, capability(), 'subj-geography'))
    assert.throws(() =>
        validateDiagramForPublication(
            { ...rectangle, view: 'labelled' },
            capability(['math.area.rectangle'], 'homework_support'),
            'subj-higher-maths'
        )
    )
    const document = { content: '%BLOCK_1%', tokens: { '%BLOCK_1%': { type: 'diagram', data: rectangle } } }
    assert.doesNotThrow(() => validateDiagramDocument(structuredClone(document), capability(), 'subj-higher-maths'))
    assert.throws(() => validateDiagramDocument({ ...document, content: '%BLOCK_1%%BLOCK_1%' }, capability(), 'subj-higher-maths'))
    assert.throws(() =>
        validateDiagramDocument({ ...document, content: 'x'.repeat(40000) + '%BLOCK_1%' }, capability(), 'subj-higher-maths')
    )
})

const candidateBase = process.env.TOBY_VISUAL_CANDIDATE_BASE
const currentSnapshot = process.env.TOBY_VISUAL_CURRENT_DEFINITIONS ? read(process.env.TOBY_VISUAL_CURRENT_DEFINITIONS) : null
const localParentId = '00000000-0000-0000-0000-000000000001'
const localFixtures = {
    parents: [
        {
            id: localParentId,
            apiConfig: JSON.stringify({
                overrideConfig: {
                    status: true,
                    nodes: { ExistingOwner: [{ name: 'existing', enabled: false }] },
                    variables: [
                        ...['userID', 'subjectId', 'sessionId'].map((name) => ({ name, type: 'runtime', enabled: true })),
                        { name: 'userid', type: 'runtime', enabled: false }
                    ]
                }
            }),
            flowData: JSON.stringify({
                nodes: [
                    { id: 'queue_0', data: { inputs: { selectedTool: 'offline-queue' } } },
                    {
                        id: 'agent_0',
                        data: {
                            name: 'toolAgent',
                            inputs: { tools: ['{{queue_0.data.instance}}'], systemMessage: 'Synthetic offline teaching prompt.' }
                        }
                    }
                ],
                edges: [{ source: 'queue_0', target: 'agent_0' }]
            })
        }
    ],
    tools: [
        {
            id: 'offline-queue',
            name: 'queue_canvas_build_v2_synthetic',
            func: "const parent='" + localParentId + "'; if(subjectId !== 'subj-higher-maths'){}; const scope={mode:'Teach Me'};"
        }
    ]
}
const definitionsFor = (kind) =>
    currentSnapshot?.[kind] ||
    (candidateBase ? read(candidateBase + '/private/current-' + (kind === 'tools' ? 'queue-tools' : kind) + '.json') : localFixtures[kind])
const flowiseRoot = new URL('../../../', import.meta.url)
const actualFilterSource = new URL('packages/server/src/utils/index.ts', flowiseRoot)
const actualSpeechSource = new URL('packages/components/src/safeVisualSpeechText.ts', flowiseRoot)
function functionsFromTypeScript(source, names) {
    const declarations = names.map((name) => {
        const start = source.indexOf('export const ' + name + ' =')
        const end = source.indexOf('\n}\n', start)
        assert.ok(start >= 0 && end > start, 'Actual upstream function boundary required: ' + name)
        return source.slice(start, end + 3)
    })
    const js = stripTypeScriptTypes(declarations.join('\n'), { mode: 'strip' }).replace(/^export /gm, '')
    const exports = {}
    new vm.Script(js + '\nObject.assign(exports,{' + names.join(',') + '});').runInNewContext({ exports, process: { env: {} } })
    return exports
}
test('fresh current candidate patches preserve every unrelated node/edge and validate all code', { skip: !candidateBase }, () => {
    const definitions = definitionsFor('builders')
    for (const definition of definitions) {
        const original = JSON.parse(definition.flowData),
            out = extendCurrentBuilder(definition),
            modified = out.graph
        assert.deepEqual(modified.edges, original.edges)
        assert.equal(out.networkWrites, false)
        for (const node of original.nodes) {
            const next = modified.nodes.find((n) => n.id === node.id),
                permitted = out.patches.filter((p) => p.nodeId === node.id).map((p) => p.input)
            for (const [key, value] of Object.entries(node.data.inputs || {}))
                if (!permitted.includes(key)) assert.deepEqual(next.data.inputs[key], value, node.id + '.' + key)
        }
        for (const patch of out.patches) {
            const before = original.nodes.find((n) => n.id === patch.nodeId).data.inputs[patch.input]
            assert.equal(createHash('sha256').update(before).digest('hex'), patch.expectedBeforeSha256)
        }
        const broken = structuredClone(definition),
            g = JSON.parse(broken.flowData)
        g.nodes = g.nodes.filter((n) => n.id !== 'customFunctionAgentflow_publish')
        broken.flowData = JSON.stringify(g)
        assert.throws(() => extendCurrentBuilder(broken))
    }
    const tools = definitionsFor('tools'),
        parents = definitionsFor('parents')
    assert.equal(tools.length, 18)
    assert.equal(parents.length, 18)
    for (const tool of tools)
        assert.match(
            extendCurrentQueueTool(tool).patch.value,
            /protectedVisualCapability: readProtectedVisualCapability\(vars.tobyDiagramCapability\)/
        )
    for (const parent of parents) {
        const patch = extendCurrentParent(parent, tools),
            graph = JSON.parse(parent.flowData),
            before = graph.nodes.find((n) => n.id === patch.patches[0].nodeId).data.inputs.systemMessage
        assert.equal(patch.patches[0].value.slice(0, before.length), before)
        assert.match(patch.patches[0].value, /\{\{\$vars.tobyDiagramAuthoringGuidance\}\}/)
        assert.equal(patch.networkWrites, false)
    }
})
test('parent API configs add only the two bounded runtime variables and preserve owned configuration', () => {
    const tools = definitionsFor('tools'),
        parents = definitionsFor('parents')
    for (const parent of parents) {
        const before = readApi(parent),
            out = extendCurrentParent(parent, tools),
            after = JSON.parse(out.apiConfig)
        assert.equal(out.sourceApiConfigSha256, createHash('sha256').update(parent.apiConfig).digest('hex'))
        assert.equal(out.candidateApiConfigSha256, createHash('sha256').update(out.apiConfig).digest('hex'))
        const names = ['tobyDiagramCapability', 'tobyDiagramAuthoringGuidance']
        assert.equal(after.overrideConfig.status, true)
        assert.deepEqual(after.overrideConfig.variables.slice(0, before.overrideConfig.variables.length), before.overrideConfig.variables)
        assert.deepEqual(
            after.overrideConfig.variables
                .slice(before.overrideConfig.variables.length)
                .map((v) => ({ name: v.name, type: v.type, enabled: v.enabled })),
            names.map((name) => ({ name, type: 'runtime', enabled: true }))
        )
        after.overrideConfig.variables = after.overrideConfig.variables.filter((v) => !names.includes(v.name))
        assert.deepEqual(after, before, 'No global, node, status, variable or other API metadata changes')
    }
    const parent = parents[0]
    for (const mutate of [
        (config) => {
            config.overrideConfig.status = false
        },
        (config) => {
            config.overrideConfig.status = 'true'
        },
        (config) => {
            config.overrideConfig.variables.find((v) => v.name === 'userID').enabled = false
        },
        (config) => {
            config.overrideConfig.variables.push({ name: 'tobyDiagramCapability', type: 'static', enabled: true })
        },
        (config) => {
            config.overrideConfig.variables.push({ name: 'tobyDiagramCapability', type: 'runtime', enabled: false })
        },
        (config) => {
            config.overrideConfig.variables.push(
                { name: 'tobyDiagramCapability', type: 'runtime', enabled: true },
                { name: 'tobyDiagramCapability', type: 'runtime', enabled: true }
            )
        }
    ]) {
        const config = readApi(parent)
        mutate(config)
        assert.throws(() => extendCurrentParent({ ...parent, apiConfig: JSON.stringify(config) }, tools))
    }
    assert.throws(() => extendCurrentParent({ ...parent, apiConfig: null }, tools))
})
function readApi(parent) {
    return JSON.parse(parent.apiConfig)
}
test(
    'actual Flowise API and variable filters deliver protected values without creating globals or admitting unlisted names',
    { skip: !existsSync(actualFilterSource) && !candidateBase },
    async () => {
        const source = readFileSync(
            existsSync(actualFilterSource) ? actualFilterSource : candidateBase + '/upstream/checkout/packages/server/src/utils/index.ts',
            'utf8'
        )
        const names = ['getAPIOverrideConfig', 'replaceInputsWithConfig', 'getGlobalVariable']
        const exports = functionsFromTypeScript(source, names)
        const tools = definitionsFor('tools')
        for (const parent of definitionsFor('parents')) {
            const candidate = extendCurrentParent(parent, tools)
            const supplied = {
                userID: 'synthetic-no-learner',
                subjectId: candidate.subjectId,
                sessionId: 'synthetic-local-session',
                tobyDiagramCapability: JSON.stringify(capability()),
                tobyDiagramAuthoringGuidance: 'Protected synthetic teaching guidance.',
                unlistedDiagramPolicy: 'must not arrive',
                userid: 'disabled spelling must not arrive'
            }
            for (const [apiConfig, ready] of [
                [parent.apiConfig, false],
                [candidate.apiConfig, true]
            ]) {
                const config = exports.getAPIOverrideConfig({ apiConfig })
                assert.equal(config.apiOverrideStatus, true)
                const request = { vars: structuredClone(supplied) }
                exports.replaceInputsWithConfig(
                    { id: 'synthetic-node', label: 'Synthetic unchanged owner', inputs: {} },
                    request,
                    config.nodeOverrides,
                    config.variableOverrides
                )
                const available = []
                const vars = await exports.getGlobalVariable(request, available, config.variableOverrides)
                assert.equal(vars.userID, supplied.userID)
                assert.equal(vars.subjectId, supplied.subjectId)
                assert.equal(vars.sessionId, supplied.sessionId)
                assert.equal(vars.tobyDiagramCapability, ready ? supplied.tobyDiagramCapability : undefined)
                assert.equal(vars.tobyDiagramAuthoringGuidance, ready ? supplied.tobyDiagramAuthoringGuidance : undefined)
                assert.equal(vars.unlistedDiagramPolicy, undefined)
                assert.equal(vars.userid, undefined)
                assert.ok(!available.some((v) => v.name === 'unlistedDiagramPolicy'))
                assert.equal(
                    parent.apiConfig,
                    apiConfig === candidate.apiConfig ? parent.apiConfig : apiConfig,
                    'Original definition remains unchanged'
                )
            }
        }
    }
)
test(
    'actual current publisher validates diagram without acquiring/publishing or changing saved shape',
    { skip: !candidateBase },
    async () => {
        const current = definitionsFor('builders')[0]
        const graph = extendCurrentBuilder(current).graph
        const code = graph.nodes.find((n) => n.id === 'customFunctionAgentflow_publish').data.inputs.code
        const staged = {
            title: 'A synthetic rectangle scaffold',
            description: 'Offline publication contract fixture.',
            playbookId: 'explain_and_check',
            playbookVersion: '2.0.0',
            htmlSkeleton:
                '<h1>A synthetic rectangle scaffold</h1><p>Learning focus: inspect the supplied dimensions.</p><p>By the end, explain how the region relates to the stated method.</p><hr><h2>Inspect the inputs</h2><p>Inspect the region and choose your own next step.</p>%BLOCK_1%',
            blocks: [
                {
                    placeholder: '%BLOCK_1%',
                    type: 'diagram',
                    section: 'concept',
                    title: 'Rectangle scaffold',
                    variant: 'hint',
                    contentHtml: '',
                    payloadLines: JSON.stringify(rectangle),
                    priority: 50,
                    required: true,
                    evidenceRef: ''
                }
            ],
            sections: ['concept'],
            summary: 'No final area is supplied.'
        }
        const state = {
            operationId: 'synthetic-local-operation',
            parentSessionId: 'synthetic-no-learner',
            subjectId: 'subj-higher-maths',
            userID: '0',
            runtimeContext: JSON.stringify({ protectedVisualCapability: capability() }),
            documentBrief: '{}',
            documentPlan: JSON.stringify({
                playbook_id: staged.playbookId,
                playbook_version: staged.playbookVersion,
                sections: [
                    { section_id: 'concept', role: 'concept', title: 'Inspect the inputs', block_types: ['diagram'], block_intents: [] }
                ],
                question_count: 0,
                tracked: false
            }),
            stagedDocument: JSON.stringify(staged),
            playbookContract: JSON.stringify({
                token_min: 0,
                token_max: 2,
                section_min: 1,
                section_max: 1,
                allowed_block_types: ['diagram']
            }),
            verifiedEvidence: '[]',
            selectedFormation: '{}',
            subtopicResolution: '{}'
        }
        let calls = 0
        const execute = async (state) =>
            new vm.Script('(async()=>{' + code + '})()').runInNewContext(
                {
                    Buffer,
                    URL,
                    TextEncoder,
                    Date,
                    $flow: { state },
                    $vars: {},
                    require: (name) =>
                        name === 'crypto'
                            ? crypto
                            : name === 'url'
                            ? { URL }
                            : name === 'node-fetch'
                            ? async () => {
                                  calls++
                                  throw Error('no_network_allowed')
                              }
                            : (() => {
                                  throw Error('unapproved_require')
                              })()
                },
                { timeout: 2000 }
            )
        const out = await execute(state)
        assert.equal(JSON.parse(out.validationResult).ok, true, out.validationResult)
        assert.equal(calls, 0)
        const saved = JSON.parse(out.capturedDocument)
        assert.equal(saved.tokens['%BLOCK_1%'].type, 'diagram')
        assert.deepEqual(saved.tokens['%BLOCK_1%'].data, parseDiagramDescriptor(rectangle))
        const denied = await execute({ ...state, runtimeContext: '{}' })
        assert.equal(JSON.parse(denied.validationResult).ok, false)
        assert.equal(calls, 0)
    }
)
test(
    'all current queue tools forward only the protected capability and retain bounded authenticated routing',
    { skip: !candidateBase },
    async () => {
        const tools = definitionsFor('tools'),
            parents = definitionsFor('parents'),
            builders = definitionsFor('builders').map((definition) => ({
                id: definition.id,
                graph: extendCurrentBuilder(definition).graph
            }))
        for (const tool of tools) {
            const parentId = tool.func.match(/[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}/)[0]
            const scope = extendCurrentParent(
                    parents.find((p) => p.id === parentId),
                    tools
                ),
                session = 'synthetic-local-owned-session'
            const vars = {
                userID: 'synthetic-user-no-database-record',
                subjectId: scope.subjectId,
                sessionId: session,
                tier: 'Foundation',
                tobyDiagramCapability: JSON.stringify(capability(['math.area.rectangle']))
            }
            for (const match of tool.func.matchAll(/vars\.([A-Za-z0-9_]+)/g))
                if (/Enabled|Secret|Token/.test(match[1])) vars[match[1]] = match[1].includes('Enabled') ? 'true' : 'synthetic-local-secret'
            const calls = []
            const transport = async (url, request) => {
                calls.push({ url, request })
                return { ok: true, status: 202, text: async () => '{"ok":true}' }
            }
            const code = extendCurrentQueueTool(tool).patch.value
            const result = await new vm.Script('(async()=>{' + code + '})()').runInNewContext(
                {
                    Buffer,
                    URL,
                    TextEncoder,
                    Date,
                    $flow: {
                        chatflowId: parentId,
                        sessionId: session,
                        input: 'Please help me reason from this supplied synthetic source.'
                    },
                    $vars: vars,
                    $objective: 'Reason from a supplied source.',
                    $outcome: 'Explain one justified inference.',
                    $scopeQuery: 'The supplied synthetic source.',
                    $substantiveContent: 'A bounded synthetic source with no personal data.',
                    $assessmentIntent: 'none',
                    require: (name) =>
                        name === 'crypto'
                            ? crypto
                            : name === 'node-fetch'
                            ? transport
                            : (() => {
                                  throw Error('unapproved_require')
                              })()
                },
                { timeout: 2000 }
            )
            assert.equal(JSON.parse(result).accepted, true, tool.name + ': ' + result)
            assert.equal(calls.length, 1)
            const envelope = JSON.parse(calls[0].request.body)
            assert.deepEqual(envelope.runtimeContext.protectedVisualCapability, readProtectedVisualCapability(vars.tobyDiagramCapability))
            assert.equal(envelope.runtimeContext.subjectId, scope.subjectId)
            assert.equal(envelope.runtimeContext.sessionId, session)
            assert.ok(Buffer.byteLength(calls[0].request.body, 'utf8') <= 16384)
            assert.ok(
                !JSON.parse(tool.schema).some((field) => /Visual|Diagram|reviewed|Template/.test(field.property)),
                'The LLM tool schema must not own capability policy'
            )
            const matches = builders.filter((builder) => tool.func.includes(builder.id))
            assert.equal(matches.length, 1)
            const graph = matches[0].graph,
                ingestion = graph.nodes.find((node) => node.id === 'customFunctionAgentflow_validate').data.inputs.code
            const ingest = (body) =>
                new vm.Script('(async()=>{' + ingestion + '})()').runInNewContext(
                    { Buffer, URL, TextEncoder, Date, $webhookBody: body, $flow: { sessionId: body.agentflowSessionId, state: {} } },
                    { timeout: 2000 }
                )
            const accepted = await ingest(envelope)
            assert.equal(accepted.isValid, 'true', tool.name + ': ' + accepted.validationCode)
            assert.deepEqual(
                JSON.parse(accepted.runtimeContext).protectedVisualCapability,
                readProtectedVisualCapability(vars.tobyDiagramCapability),
                'Signed webhook normalization must retain bounded capability'
            )
            const badScope = await ingest({ ...envelope, chatId: 'wrong-runtime-scope' })
            assert.equal(badScope.isValid, 'false')
            assert.equal(JSON.parse(badScope.runtimeContext).protectedVisualCapability, null)
            const unavailable = await ingest({
                ...envelope,
                runtimeContext: { ...envelope.runtimeContext, protectedVisualCapability: null }
            })
            assert.equal(JSON.parse(unavailable.runtimeContext).protectedVisualCapability, null)
            if (scope.subjectId === 'subj-higher-maths' && !/Homework/i.test(scope.mode)) {
                const row = benchmark.cases.find(
                    (row) =>
                        row.subjectId === 'subj-higher-maths' && row.expectedCapabilityId === 'template_diagram' && row.expectedPublication
                )
                const fixture = planFor(row),
                    guard = graph.nodes.find((node) => node.id === 'customFunctionAgentflow_plan_guard').data.inputs.code
                const resolution = {
                    verified: true,
                    state: 'verified_exact',
                    subtopic_id: row.canonicalSubtopicId,
                    subject_id: row.subjectId,
                    resolution_hash: 'synthetic-local-resolution'
                }
                const run = (runtimeContext) =>
                    new vm.Script('(async()=>{' + guard + '})()').runInNewContext(
                        {
                            Buffer,
                            URL,
                            TextEncoder,
                            Date,
                            $flow: {
                                state: {
                                    ...accepted,
                                    subjectId: scope.subjectId,
                                    runtimeContext,
                                    launchContext: '{}',
                                    evidenceContext: '{}',
                                    documentBrief: JSON.stringify({ ...fixture.context, mode: 'Teach Me' }),
                                    subtopicResolution: JSON.stringify(resolution),
                                    rawDocumentPlan: JSON.stringify(fixture.plan)
                                }
                            },
                            $vars: {},
                            require: (name) =>
                                name === 'crypto'
                                    ? crypto
                                    : (() => {
                                          throw Error('No network/provider call allowed')
                                      })()
                        },
                        { timeout: 2000 }
                    )
                const permitted = await run(accepted.runtimeContext)
                assert.equal(permitted.planGuardOk, 'true', permitted.planGuard)
                const denied = await run(unavailable.runtimeContext)
                assert.equal(denied.planGuardOk, 'false')
            }
        }
    }
)
test(
    'pre-synthesis candidate preserves ordinary JSON and removes complete/malformed reserved fences',
    { skip: !existsSync(actualSpeechSource) && !candidateBase },
    () => {
        const source = readFileSync(
            existsSync(actualSpeechSource) ? actualSpeechSource : candidateBase + '/upstream/safeVisualSpeechText.ts',
            'utf8'
        )
        const js = stripTypeScriptTypes(source, { mode: 'strip' }).replace(/^export /gm, '')
        const exports = {}
        new vm.Script(js + '\nObject.assign(exports,{safeVisualSpeechText});').runInNewContext({ exports })
        const speech = exports.safeVisualSpeechText
        const normal = 'Learn JSON:\n```json\n{"v":1,"t":"ordinary"}\n```'
        assert.equal(speech(normal), normal)
        for (const header of [
            'toby-diagram',
            'toby-diagram extra',
            'toby-diagram{attrs}',
            'mermaid',
            'vega-lite',
            'jsxgraph',
            'smiles',
            'ketcher'
        ]) {
            assert.ok(!speech('Look.\n```' + header + '\nSECRET').includes('SECRET'))
            assert.ok(!speech('Look.\n```' + header + '\nSECRET\n```\nExplain.').includes('SECRET'))
            assert.ok(speech('Look.\n```' + header + '\nSECRET\n```\nExplain.').includes('Explain.'))
        }
        assert.ok(speech('```toby-diagram').includes('Visual.'))
    }
)
