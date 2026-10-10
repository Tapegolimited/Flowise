import { CAPABILITY_REGISTRY, explicitStudentDocumentType } from './candidate-planner.mjs'
import { compileCandidate } from './compile-candidate.mjs'
import { normalizeVideoBrief } from '../toby-youtube-v1/video-brief.mjs'
import { effectiveCapabilityRegistry } from './visual-capability.mjs'

const copy = (value) => JSON.parse(JSON.stringify(value))
const canonicalNonempty = (value) => typeof value === 'string' && value.trim().length > 0
export function compilePlan(raw, { context, catalogue, resolution = {}, evidence = [], subjectId = context.subjectId }) {
    const registry = effectiveCapabilityRegistry(CAPABILITY_REGISTRY, context)
    const canonical =
        resolution.verified === true &&
        ['verified_exact', 'verified_alias'].includes(resolution.state) &&
        Number.isSafeInteger(resolution.subtopic_id) &&
        resolution.subtopic_id > 0 &&
        resolution.subject_id === subjectId &&
        canonicalNonempty(resolution.resolution_hash)
    // Canonical IDs are copied by trusted code after resolution, never invented by
    // the planner. A conflicting model-supplied ID remains a validation error.
    const resolvedPlan = copy(raw)
    if (resolvedPlan.videoBrief === undefined) resolvedPlan.videoBrief = null
    if (canonical)
        for (const section of resolvedPlan.sections || [])
            for (const block of section.blocks || [])
                if (block.capabilityId === 'question' && block.subtopicId == null) block.subtopicId = resolution.subtopic_id
    const result = compileCandidate(resolvedPlan, {
        context: { ...context, canonicalSubtopicId: canonical ? resolution.subtopic_id : null },
        registry,
        ...catalogue
    })
    const plan = result.plan,
        errors = [...result.validation.errors],
        warnings = [...result.validation.warnings]
    if (plan.choice?.requestedTypeStatus === 'cannot_satisfy') errors.push('explicit_document_format_requires_clarification')
    const playbook = catalogue.playbookCatalogue.find((p) => p.id === plan.choice?.playbookId)
    const selected = catalogue.formationCatalogue.find((f) => f.playbookId === plan.choice?.playbookId && f.id === plan.choice?.formationId)
    const supplied = context.substantiveContent
    const suppliedIds = new Set(Array.isArray(supplied) ? supplied.map((e) => e?.id || e?.source_id || e?.evidence_id).filter(Boolean) : [])
    const evidenceIds = new Set(
        evidence.filter((e) => e.verified === true && e.result && Object.keys(e.result).length).map((e) => e.evidence_id)
    )
    const trustedIds = new Set([...suppliedIds, ...evidenceIds])
    for (const resource of plan.resources || []) {
        for (const ref of resource.providedEvidenceRefs || []) if (!trustedIds.has(ref)) errors.push('unbound_evidence_reference:' + ref)
        if (resource.kind === 'document' && resource.required !== false) errors.push('pdf_must_be_optional:' + resource.id)
    }
    if (
        ['subj-combined-sci', 'combined_science'].includes(subjectId) &&
        String(context.contextSignals?.curriculum?.tier || '').toLowerCase() !== 'foundation'
    )
        errors.push('combined_science_requires_foundation')
    const capabilities = new Map(registry.capabilities.map((c) => [c.id, c]))
    const blocks = (plan.sections || []).flatMap((s) => s.blocks || [])
    const tracked = blocks.some((b) => b.capabilityId === 'question')
    const assessed = tracked && context.assessmentIntent === 'tracked_question_block'
    if (tracked && !assessed) errors.push('question_requires_explicit_assessment_intent')
    if (tracked && !canonical) warnings.push('publication_blocked_until_canonical_resolution')
    const sectionCount = (plan.sections || []).length
    const tokenMax = Math.min(playbook?.tokenMax ?? 8, CAPABILITY_REGISTRY.presentation.budgets.maximumBlocks)
    const sections = (plan.sections || []).map((s, i) => ({
        section_id: s.id,
        role: s.role,
        title: s.title,
        priority: 50,
        estimated_words: Math.max(80, Math.ceil(760 / Math.max(1, sectionCount))),
        purpose: s.purpose,
        html_treatment: s.proseFocus,
        prose_focus: s.proseFocus,
        transition_purpose: s.transitionPurpose,
        visual_variant: s.semanticStyle,
        representation_purpose: (s.blocks || [])
            .map((b) => [b.purpose, b.anchor?.whatToNotice, b.anchor?.connectionToExplanation].filter(Boolean).join(' '))
            .join(' '),
        block_types: (s.blocks || []).map((b) => capabilities.get(b.capabilityId)?.blockType).filter(Boolean),
        block_intents: copy(s.blocks || [])
    }))
    const videoSections = sections.filter((s) => s.block_types.includes('video'))
    const videoBrief = normalizeVideoBrief(raw.videoBrief)
    if (videoSections.length > 1 || videoSections.some((s) => s.block_types.filter((t) => t === 'video').length !== 1))
        errors.push('video_budget_exceeded')
    if (videoSections.length && (!videoBrief || videoBrief.objective !== videoSections[0].purpose))
        errors.push('video_requires_exact_purpose_brief')
    const requests = (plan.resources || [])
        .filter((r) => !r.providedEvidenceRefs?.length && !['document', 'video', 'canonical_subtopic'].includes(r.kind))
        .map((r) => ({
            request_id: r.id,
            type: r.kind === 'image' ? 'image' : r.kind === 'calculation' ? 'calculation' : 'current_web',
            query: r.acquisitionBrief,
            purpose: r.purpose,
            required: r.required === true && r.kind !== 'image',
            freshness_reason: r.kind === 'source' ? 'Specific source needed to meet the objective.' : ''
        }))
    if (requests.length > 6) errors.push('evidence_request_budget_exceeded')
    const publicationAllowed = !errors.length && (!tracked || canonical)
    const informal = blocks.some((b) => b.capabilityId === 'mcq')
    const questionCount = tracked ? Math.max(1, Math.min(15, Number(context.questionCount) || 10)) : informal ? 4 : 0
    const legacyPlan = {
        playbook_id: plan.choice?.playbookId,
        playbook_version: plan.choice?.contract_version,
        formation_id: plan.choice?.formationId,
        title: plan.title,
        description: plan.description,
        canonical_subtopic_id: canonical ? resolution.subtopic_id : 0,
        sections,
        token_count: blocks.filter((b) => capabilities.get(b.capabilityId)?.blockType).length,
        purposeful_anchor_count: blocks.length,
        purposeful_anchor_types: [...new Set(sections.flatMap((s) => s.block_types))],
        anchor_families: [],
        evidence_requests: requests.slice(0, 6),
        candidate_resources: copy(plan.resources || []),
        estimated_bytes: 32000,
        question_count: questionCount,
        entry_question_count: tracked ? Math.round(questionCount * 0.6) : questionCount,
        peak_question_count: tracked ? questionCount - Math.round(questionCount * 0.6) : 0,
        tracked,
        summary: plan.choice?.rationale,
        video_brief: videoSections.length === 1 ? videoBrief : null,
        subject_visual_need: plan.subjectVisualNeed,
        content_provenance: {
            substantiveContent: copy(supplied ?? ''),
            planningSuggestions: copy(context.planningSuggestions ?? []),
            explicitStudentDocumentType: explicitStudentDocumentType(context) ?? null
        },
        publication_allowed: publicationAllowed
    }
    const contract = {
        playbook_id: plan.choice?.playbookId,
        playbook_version: '2.0.0',
        renderer_compat: 'canvas-agentflow-v2.0.0',
        source_contract_version: playbook?.sourceVersion,
        status: 'active',
        token_min: 0,
        token_max: tokenMax,
        section_min: sectionCount,
        section_max: sectionCount,
        maximum_serialized_document_utf8_bytes: 40000,
        maximum_token_map_entries: 24,
        allowed_block_types: [...new Set(registry.capabilities.map((c) => c.blockType).filter(Boolean))],
        maximum_diagrams: 2,
        maximum_diagram_utf8_bytes: 12000,
        supported_evidence_tools: ['calculation', 'wolfram', 'image', 'current_web'],
        assessment_policy: playbook?.assessmentPolicy,
        current_evidence_policy: 'Acquire only purpose-bound authoritative evidence. Keenable preferred; reuse supplied content.',
        informal_check_policy: { minimum_questions: 2, target_questions: 4, maximum_questions: 6 },
        quality_requirements: {
            minimum_anchor_families: 0,
            minimum_purposeful_anchors: 0,
            require_representation: false,
            require_semantic_signpost_feature: true,
            interpretation_required_after: [
                'table',
                'image',
                'gallery',
                'chart',
                'map',
                'jsxgraph',
                'learning_visual',
                'ketcher',
                'diagram'
            ]
        },
        composition_quality: {
            maximum_dense_paragraphs_without_break: 2,
            maximum_paragraph_visible_words: 90,
            representation_types: [
                'table',
                'stepper',
                'image',
                'gallery',
                'chart',
                'map',
                'latex',
                'jsxgraph',
                'learning_visual',
                'ketcher',
                ...(capabilities.has('template_diagram') ? ['diagram'] : [])
            ],
            anchor_family_types: {}
        },
        block_transition_matrix: {},
        reduction_rules: [],
        depth_policy: { default_core_words: [650, 1000], optional_assets_count: false }
    }
    const formation = {
        formation_id: selected?.id,
        required_section_sequence: selected?.requiredSectionSequence || [],
        runtime_skeleton: {
            sections: sections.map((s) => ({
                section_id: s.section_id,
                role: s.role,
                heading_pattern: s.title,
                prose_pattern: s.prose_focus,
                token_hint: ''
            }))
        },
        presentation_contract: {
            header_variant: 'objective_and_outcome',
            header_pattern: {
                required_sequence: ['h1_document_title', 'p_learning_focus', 'p_learner_outcome', 'hr', 'h2_first_section'],
                token_placeholders_allowed: false
            },
            html_section_roles: sections.map((s, i) => ({
                order: i + 1,
                role: s.role,
                heading_level: 'h2',
                purpose: s.purpose,
                visual_variant: s.visual_variant
            })),
            composition_profile: {
                preferred_anchor_types: legacyPlan.purposeful_anchor_types,
                minimum_anchor_families: 0,
                minimum_purposeful_anchors: 0
            },
            section_design: {
                deterministic: true,
                section_number_badge: true,
                variants: ['concept', 'example', 'caution', 'practice', 'summary']
            },
            summary_pattern: selected?.closingPurpose
        },
        suggested_token_sequence: legacyPlan.purposeful_anchor_types
    }
    return {
        plan,
        legacyPlan,
        contract,
        formation,
        changes: result.changes,
        publicationAllowed,
        validation: { valid: !errors.length, errors, warnings, publicationAllowed },
        policy: 'No count padding, inferred facts or assessment downgrade. One bounded model repair may correct a failed plan; hard maxima remain.'
    }
}
