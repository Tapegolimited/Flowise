import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'
import { bundleModules } from './bundle.mjs'
import { CAPABILITY_REGISTRY } from './candidate-planner.mjs'

const digest = (value) => createHash('sha256').update(value).digest('hex')
function once(source, before, after, label) {
    if (source.split(before).length !== 2) throw new Error('current_source_anchor_mismatch:' + label)
    return source.replace(before, after)
}
const parser = bundleModules(['diagram-descriptor.generated.mjs', 'visual-capability.mjs'])
const modules = bundleModules([
    'diagram-descriptor.generated.mjs',
    'visual-capability.mjs',
    'candidate-planner.mjs',
    'candidate-planner-v2.mjs',
    'compile-candidate.mjs',
    '../toby-youtube-v1/video-brief.mjs',
    'compiler.mjs',
    'provider.mjs'
])
const publicationCapability = `readProtectedVisualCapability(JSON.parse($flow.state.runtimeContext||'{}').protectedVisualCapability)`
const diagramAuthoring = `\nStatic template extension: use a diagram block only when block_intents select template_diagram and the compiled contract permits it. payloadLines is one canonical DATA descriptor, no token/data wrapper: {schemaVersion:1,templateId:<exact planned family>,templateVersion:'1.0.0',parameters:<strict template parameters>,variant:'hint'|'blank'|'labelled'}. No caller SVG, HTML, code, URL, title, alt or caption. Trusted code owns those fields. Geometry requires supplied positive dimensions0.1–1000 and units mm|cm|m: rectangle width,height; triangle base,height; trapezium topBase,bottomBase,height with different bases. Optional shading region|none; triangle alone optional heightPosition inside|outside. Labelled shows inputs only, no computed area or solution formula. Forces: objectLabel plain1–48 UTF16 units,forces1–4 unique directions up|down|left|right with plain label1–32; magnitude0.1–10000 requires unit N, unit without magnitude forbidden. Particles: state solid|liquid|gas,optional different compareTo; equal fixed particle counts are code-owned, no invented counts or temperature. Cells: optional labels boolean, highlights0–3 unique structures; animal nucleus/cytoplasm/cell_membrane/mitochondria, plant additionally cell_wall/chloroplasts/vacuole. Hint/blank withhold labels/values in all visual and accessible content. Homework hint/blank only; active independent assessment forbids diagram coaching. At most2diagram blocks,12000UTF8 bytes per descriptor,40000bytes/24blocks per document. Anchor a purposeful diagram in surrounding explanation; preserve the existing specialist owner for numerical chart, function graph, molecule, map, notation or verified image. Do not use JSON or a diagram as a substitute for learner authorship.\n`

const diagramReviewBounds =
    '\nAutomated primary-source review permits bounded GCSE common-core teaching use only, without human expert signoff or exam-board endorsement. Geometry is schematic: do not infer scale, angles, sloping side lengths, symmetry or similarity. Forces identify supplied cardinal directions on one object; no scale vectors, components, moments or Newton third-law pairs. Static particle diagrams compare arrangement only; no quantities, motion, temperature, bonds or density inference. Cell models show selected structures and omit ribosomes; the plant example is photosynthetic, not every plant cell. They are not micrographs, observed practical drawings or magnification evidence. Combined Science diagrams require protected Foundation curriculumScope with the canonical positive subtopic and exactly the current strand. Never infer it from a subject name, target grade or model brief.\n'

const diagramRuntimeNames = ['tobyDiagramCapability', 'tobyDiagramAuthoringGuidance']
/** Runtime variables need explicit API permission, but no global-variable write. */
function extendParentApiConfig(definition) {
    if (typeof definition.apiConfig !== 'string') throw new Error('current_parent_api_config_required')
    const config = JSON.parse(definition.apiConfig),
        overrides = config?.overrideConfig
    if (
        !overrides ||
        overrides.status !== true ||
        !Array.isArray(overrides.variables) ||
        !overrides.nodes ||
        typeof overrides.nodes !== 'object' ||
        Array.isArray(overrides.nodes)
    ) {
        throw new Error('current_parent_api_override_not_ready')
    }
    for (const name of ['userID', 'subjectId', 'sessionId']) {
        const matches = overrides.variables.filter((variable) => variable?.name === name)
        if (matches.length !== 1 || matches[0].enabled !== true || matches[0].type !== 'runtime') {
            throw new Error('current_parent_owned_runtime_missing:' + name)
        }
    }
    for (const name of diagramRuntimeNames) {
        const matches = overrides.variables.filter((variable) => variable?.name === name)
        if (matches.length > 1 || (matches.length === 1 && (matches[0].enabled !== true || matches[0].type !== 'runtime'))) {
            throw new Error('current_parent_diagram_runtime_conflict:' + name)
        }
        if (!matches.length) overrides.variables.push({ id: 'toby-template-diagram-v1-' + name, name, type: 'runtime', enabled: true })
    }
    const apiConfig = JSON.stringify(config)
    return { apiConfig, sourceApiConfigSha256: digest(definition.apiConfig), candidateApiConfigSha256: digest(apiConfig) }
}

/** A candidate derived from a caller-supplied CURRENT definition. No network or deploy. */
export function extendCurrentBuilder(definition) {
    if (!definition?.id || typeof definition.flowData !== 'string') throw new Error('current_builder_definition_required')
    const original = JSON.parse(definition.flowData),
        graph = structuredClone(original),
        patches = []
    const update = (node, code) => {
        new vm.Script('(async function(){' + code + '})')
        const previous = node.data.inputs.code
        if (node.data.inputs.customFunctionJavascriptFunction !== previous) throw new Error('code_alias_mismatch:' + node.id)
        for (const input of ['code', 'customFunctionJavascriptFunction']) {
            patches.push({ nodeId: node.id, input, expectedBeforeSha256: digest(previous), value: code })
            node.data.inputs[input] = code
        }
    }
    for (const node of graph.nodes) {
        let code = node.data?.inputs?.code
        if (typeof code !== 'string') continue
        if (node.id === 'customFunctionAgentflow_validate') {
            code = parser + '\n' + code
            code = once(
                code,
                'runtimeContext: JSON.stringify({\n    sessionId:',
                'runtimeContext: JSON.stringify({\n    protectedVisualCapability: isValid ? readProtectedVisualCapability(runtime.protectedVisualCapability) : null,\n    sessionId:',
                'authenticated webhook capability ingestion'
            )
            update(node, code)
        } else if (['llmAgentflow_planner', 'customFunctionAgentflow_plan_guard'].includes(node.id)) {
            const start = code.indexOf('const CANDIDATE_VERSION ='),
                end = code.indexOf('const decode=(v,f={})=>')
            if (start < 0 || end <= start) throw new Error('planner_module_boundary_mismatch:' + node.id)
            const constants = code.slice(0, start)
            const registry = constants.match(/const CAPABILITY_REGISTRY=(\{[^\n]*\});/)
            if (!registry) throw new Error('registry_boundary_mismatch')
            code =
                constants.replace(registry[0], 'const CAPABILITY_REGISTRY=' + JSON.stringify(CAPABILITY_REGISTRY) + ';') +
                modules +
                '\n' +
                code.slice(end)
            code = once(
                code,
                'canonicalSubtopicId:resolution.verified?resolution.subtopic_id:null,',
                'canonicalSubtopicId:resolution.verified?resolution.subtopic_id:null,\nprotectedVisualCapability:readProtectedVisualCapability(runtime.protectedVisualCapability),',
                'protected planner capability'
            )
            if (node.id === 'llmAgentflow_planner')
                code = once(code, 'schema:CANDIDATE_PLAN_SCHEMA,', 'schema:prompt.responseSchema,', 'effective planner schema')
            update(node, code)
        } else if (node.id === 'customFunctionAgentflow_formation_compiler') {
            const registry = code.match(/const CAPABILITY_REGISTRY=(\{[^\n]*\});/)
            if (!registry) throw new Error('formation_registry_boundary_mismatch')
            update(node, code.replace(registry[0], 'const CAPABILITY_REGISTRY=' + JSON.stringify(CAPABILITY_REGISTRY) + ';'))
        } else if (['llmAgentflow_renderer', 'llmAgentflow_repair'].includes(node.id)) {
            const prompt = code.match(/role:'system',content:("(?:\\.|[^"\\])*")/)
            if (!prompt) throw new Error('authoring_prompt_boundary_mismatch')
            update(
                node,
                once(
                    code,
                    prompt[0],
                    "role:'system',content:" + JSON.stringify(JSON.parse(prompt[1]) + diagramAuthoring + diagramReviewBounds),
                    'diagram authoring guidance'
                )
            )
        } else if (['customFunctionAgentflow_composition', 'customFunctionAgentflow_composition_recheck'].includes(node.id)) {
            code = parser + '\n' + code
            code = once(
                code,
                'const issues = [];',
                `const issues = [];
  const diagramBlocks=(staged.blocks||[]).filter(b=>b.type==='diagram');
  if(diagramBlocks.length>2)issues.push('diagram_document_count_budget');
  for(const block of diagramBlocks){try{validateDiagramForPublication(JSON.parse(block.payloadLines),${publicationCapability},$flow.state.subjectId);}catch(error){issues.push('diagram_contract:'+error.message);}}`,
                'composition diagram contract'
            )
            update(node, code)
        } else if (['customFunctionAgentflow_publish', 'customFunctionAgentflow_publish_repaired'].includes(node.id)) {
            code = parser + '\n' + code
            code = once(
                code,
                "'cta','gallery','learning_visual','ketcher']);",
                "'cta','gallery','learning_visual','ketcher','diagram']);",
                'diagram token allowlist'
            )
            code = once(
                code,
                'case "gallery": case "learning_visual":',
                'case "diagram": {parseDiagramDescriptor(token.data);break;}\n    case "gallery": case "learning_visual":',
                'diagram reader validator'
            )
            code = once(
                code,
                "if(['learning_visual','ketcher'].includes(tokenType)){",
                `if(tokenType==='diagram'){
      return validateDiagramForPublication(JSON.parse(String(block.payloadLines||'')),${publicationCapability},$flow.state.subjectId);
    }
    if(['learning_visual','ketcher'].includes(tokenType)){`,
                'diagram publication compiler'
            )
            code = once(
                code,
                'const validated = validateCanvasPayload(',
                `validateDiagramDocument({title:staged.title,description:staged.description,content:staged.content,tokens},${publicationCapability},$flow.state.subjectId);
  const validated = validateCanvasPayload(`,
                'diagram final document guard'
            )
            update(node, code)
        }
    }
    if (new Set(patches.map((p) => p.nodeId)).size !== 10) throw new Error('current_builder_required_nodes_missing')
    return {
        builderId: definition.id,
        sourceUpdatedAt: definition.updatedDate,
        sourceFlowSha256: digest(definition.flowData),
        candidateFlowSha256: digest(JSON.stringify(graph)),
        patches,
        graph,
        status: 'offline-candidate-generation-default-off',
        networkWrites: false
    }
}

export function extendCurrentQueueTool(tool) {
    if (!tool?.name?.startsWith('queue_canvas_build_v2') || typeof tool.func !== 'string') throw new Error('current_queue_tool_required')
    let code = parser + '\n' + tool.func
    code = once(
        code,
        'runtimeContext: {\n    sessionId: parentSessionId,',
        'runtimeContext: {\n    protectedVisualCapability: readProtectedVisualCapability(vars.tobyDiagramCapability),\n    sessionId: parentSessionId,',
        'queue protected capability forwarding'
    )
    new vm.Script('(async function(){' + code + '})')
    return {
        toolId: tool.id,
        name: tool.name,
        sourceFunctionSha256: digest(tool.func),
        candidateFunctionSha256: digest(code),
        patch: { input: 'func', expectedBeforeSha256: digest(tool.func), value: code },
        status: 'offline-candidate',
        networkWrites: false
    }
}

export function extendCurrentParent(definition, queueTools) {
    if (!definition?.id || typeof definition.flowData !== 'string') throw new Error('current_parent_required')
    const api = extendParentApiConfig(definition)
    const matching = queueTools.filter((tool) => tool.func.match(/[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}/)?.[0] === definition.id)
    if (matching.length !== 1) throw new Error('parent_queue_scope_ambiguous')
    const tool = matching[0],
        graph = JSON.parse(definition.flowData)
    const queueNodes = graph.nodes.filter((node) => node.data.inputs?.selectedTool === tool.id)
    if (queueNodes.length !== 1) throw new Error('current_parent_queue_node_mismatch')
    const active = graph.nodes.filter(
        (node) =>
            node.data.name === 'toolAgent' &&
            (node.data.inputs.tools || []).includes('{{' + queueNodes[0].id + '.data.instance}}') &&
            graph.edges.some((edge) => edge.source === queueNodes[0].id && edge.target === node.id)
    )
    if (active.length !== 1) throw new Error('current_parent_queue_binding_mismatch')
    const node = active[0],
        before = node.data.inputs.systemMessage
    if (typeof before !== 'string' || before.includes('TOBY_TEMPLATE_DIAGRAM_V1_START')) throw new Error('current_parent_prompt_mismatch')
    const subject =
        tool.func.match(/subjectId\s*!==\s*['"]([^'"]+)['"]/)?.[1] || tool.func.match(/toLowerCase\(\)\s*!==\s*['"]([^'"]+)['"]/)?.[1]
    if (!subject) throw new Error('current_parent_subject_lock_missing')
    const mode = tool.func.match(/mode:\s*("[^"]*"|'[^']*')/)?.[1]
    const after =
        before +
        '\n\n<!-- TOBY_TEMPLATE_DIAGRAM_V1_START -->\n{{$vars.tobyDiagramAuthoringGuidance}}\n<!-- TOBY_TEMPLATE_DIAGRAM_V1_END -->'
    return {
        parentId: definition.id,
        sourceUpdatedAt: definition.updatedDate,
        sourceFlowSha256: digest(definition.flowData),
        ...api,
        subjectId: subject,
        mode,
        queueToolId: tool.id,
        designatedTestFlow: definition.id === '076230ec-507b-4e7f-a100-512c3e53d032',
        patches: [{ nodeId: node.id, input: 'systemMessage', expectedBeforeSha256: digest(before), value: after }],
        status: 'offline-parent-authoring-candidate-empty-with-server-flags-off',
        networkWrites: false
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const [buildersPath, toolsPath, outputPath, parentsPath] = process.argv.slice(2)
    if (!buildersPath || !toolsPath || !outputPath)
        throw new Error('Usage: node diagram-candidate-extension.mjs CURRENT_BUILDERS_JSON CURRENT_QUEUE_TOOLS_JSON OUTPUT_DIRECTORY')
    const builders = JSON.parse(readFileSync(buildersPath, 'utf8')).map(extendCurrentBuilder)
    const tools = JSON.parse(readFileSync(toolsPath, 'utf8')).map(extendCurrentQueueTool)
    const parents = parentsPath
        ? JSON.parse(readFileSync(parentsPath, 'utf8')).map((definition) =>
              extendCurrentParent(definition, JSON.parse(readFileSync(toolsPath, 'utf8')))
          )
        : []
    mkdirSync(outputPath, { recursive: true })
    // Do not distribute credential-bearing whole Flowise definitions. Patches bind
    // current code by SHA; release must refetch and reject drift before applying.
    for (const { graph, ...candidate } of builders)
        writeFileSync(outputPath + '/' + candidate.builderId + '.patch.json', JSON.stringify(candidate, null, 2) + '\n')
    writeFileSync(outputPath + '/queue-tools.patch.json', JSON.stringify(tools, null, 2) + '\n')
    writeFileSync(outputPath + '/parents.patch.json', JSON.stringify(parents, null, 2) + '\n')
    const receipt = {
        builtAt: new Date().toISOString(),
        builders: builders.map(({ builderId, sourceUpdatedAt, sourceFlowSha256, candidateFlowSha256 }) => ({
            builderId,
            sourceUpdatedAt,
            sourceFlowSha256,
            candidateFlowSha256
        })),
        queueToolCount: tools.length,
        parentCount: parents.length,
        networkWrites: false,
        generationDefault: false,
        reviewApprovalDefault: []
    }
    writeFileSync(outputPath + '/receipt.json', JSON.stringify(receipt, null, 2) + '\n')
    console.log(JSON.stringify(receipt))
}
