import { DIAGRAM_TEMPLATE_IDS, parseDiagramDescriptor } from './diagram-descriptor.generated.mjs'

export const IMPLEMENTED_CHART_FAMILIES = ['bar', 'line', 'area', 'pie']
export const APPROVED_RELATIONSHIP_DESIGNS = ['concept_tree', 'causal_network', 'feedback_loop', 'evidence_map', 'probability_tree']
const subjectTemplates = {
    'subj-higher-maths': ['math'],
    'subj-biology': ['biology'],
    'subj-chemistry': ['chemistry'],
    'subj-physics': ['physics'],
    'subj-combined-sci': ['biology', 'chemistry', 'physics']
}

function readCurriculumScope(value) {
    if (
        !value ||
        typeof value !== 'object' ||
        Array.isArray(value) ||
        value.subjectId !== 'subj-combined-sci' ||
        value.tier !== 'Foundation' ||
        !['biology', 'chemistry', 'physics'].includes(value.strand) ||
        !Number.isSafeInteger(value.canonicalSubtopicId) ||
        value.canonicalSubtopicId < 1
    )
        return null
    return { subjectId: value.subjectId, tier: value.tier, strand: value.strand, canonicalSubtopicId: value.canonicalSubtopicId }
}

function allowedSubjectPrefixes(subjectId, capability) {
    if (subjectId === 'subj-combined-sci') {
        const scope = capability?.curriculumScope
        return scope?.subjectId === subjectId ? [scope.strand] : []
    }
    return subjectTemplates[subjectId] || []
}

/** Input is the protected gateway variable, never an LLM brief or browser mode. */
export function readProtectedVisualCapability(value) {
    let data = value
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data)
        } catch {
            data = null
        }
    }
    if (!data || typeof data !== 'object' || Array.isArray(data) || data.schemaVersion !== 1) return null
    const mode = typeof data.mode === 'string' ? data.mode : ''
    const safe = ['teach_me', 'homework_support', 'revision'].includes(mode)
        ? ['none', 'completed', 'review'].includes(data.assessmentState)
        : mode.includes('paper') && ['completed', 'review'].includes(data.assessmentState)
    return {
        schemaVersion: 1,
        generationEnabled: data.generationEnabled === true && safe,
        mode,
        assessmentState: data.assessmentState,
        curriculumScope: readCurriculumScope(data.curriculumScope),
        allowedTemplateIds: Array.isArray(data.allowedTemplateIds)
            ? [...new Set(data.allowedTemplateIds.filter((id) => DIAGRAM_TEMPLATE_IDS.includes(id)))]
            : [],
        chartFamilies: IMPLEMENTED_CHART_FAMILIES,
        relationshipDesigns: APPROVED_RELATIONSHIP_DESIGNS
    }
}

export function effectiveCapabilityRegistry(registry, context = {}) {
    const capability = readProtectedVisualCapability(context.protectedVisualCapability)
    const prefixes = allowedSubjectPrefixes(context.subjectId, capability)
    const allowed = capability?.generationEnabled ? capability.allowedTemplateIds.filter((id) => prefixes.includes(id.split('.')[0])) : []
    const copy = JSON.parse(JSON.stringify(registry))
    copy.capabilities = copy.capabilities
        .filter((row) => row.blockType !== 'diagram' || allowed.length > 0)
        .map((row) => {
            if (row.blockType === 'diagram') return { ...row, families: allowed }
            if (row.blockType === 'chart') return { ...row, families: IMPLEMENTED_CHART_FAMILIES }
            if (row.blockType === 'learning_visual') return { ...row, families: APPROVED_RELATIONSHIP_DESIGNS }
            return row
        })
    return copy
}

export function validateDiagramForPublication(input, protectedValue, subjectId) {
    const descriptor = parseDiagramDescriptor(input)
    const capability = readProtectedVisualCapability(protectedValue)
    if (!capability?.generationEnabled || !capability.allowedTemplateIds.includes(descriptor.templateId))
        throw new Error('diagram_generation_disabled_or_unreviewed')
    if (!allowedSubjectPrefixes(subjectId, capability).includes(descriptor.templateId.split('.')[0]))
        throw new Error('diagram_subject_or_curriculum_conflict')
    if (capability.mode === 'homework_support' && descriptor.variant === 'labelled') throw new Error('diagram_homework_requires_scaffold')
    return descriptor
}

export function validateDiagramDocument(document, protectedValue, subjectId) {
    if (new TextEncoder().encode(JSON.stringify(document)).byteLength > 40000) throw new Error('diagram_document_byte_budget')
    if (!document.tokens || typeof document.tokens !== 'object' || Array.isArray(document.tokens))
        throw new Error('diagram_token_map_required')
    if (Object.keys(document.tokens).length > 24) throw new Error('diagram_document_block_budget')
    let count = 0
    for (const [key, token] of Object.entries(document.tokens)) {
        if (token?.type !== 'diagram') continue
        if (++count > 2) throw new Error('diagram_document_count_budget')
        if (!/^%[A-Za-z0-9_]+%$/.test(key) || String(document.content || '').split(key).length !== 2)
            throw new Error('diagram_placeholder_contract')
        token.data = validateDiagramForPublication(token.data, protectedValue, subjectId)
    }
    return document
}
