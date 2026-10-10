import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compilePlan } from '../compiler.mjs'

const catalogue = JSON.parse(readFileSync(new URL('../catalogue.json', import.meta.url), 'utf8'))
const fixtures = JSON.parse(readFileSync(new URL('./heldout-cases.json', import.meta.url), 'utf8'))
const context = fixtures.cases.find((c) => c.id === 'H-PHYS-01').context
const copy = (value) => structuredClone(value)
function basePlan(ctx = context) {
    const playbook = catalogue.playbookCatalogue.find((p) => p.id === 'explain_and_check')
    const formation = catalogue.formationCatalogue.find((f) => f.playbookId === playbook.id)
    const source = ctx.substantiveContent[0].source_id
    return {
        version: 'agent-owned-planner.v1',
        title: 'Test a proportionality inference',
        description: 'Synthetic compiler-contract fixture; not a teacher-reviewed learning document.',
        choice: {
            playbookId: playbook.id,
            formationId: formation.id,
            contract_version: formation.version,
            rationale: 'Explanation and independent reasoning serve the supplied objective.',
            requestedTypeStatus: 'absent'
        },
        subjectVisualNeed: {
            disciplinaryDemand: 'Distinguish a constant ratio from a rising trend.',
            whatToNotice: 'The supplied ratios remain constant.',
            representationReason: 'Coordinate the given values with the inference.'
        },
        sections: formation.requiredSectionSequence.map((role, i) => ({
            id: 'sec_' + i,
            role,
            title: 'Section ' + (i + 1),
            purpose: 'Develop the evidence-based proportionality judgement.',
            proseFocus: 'Use the supplied synthetic values and explain the limit of the inference.',
            transitionPurpose: 'Connect the judgement to the next reasoning step.',
            semanticStyle: 'concept',
            blocks: i === 0 ? [block()] : []
        })),
        resources: [
            {
                id: 'res_values',
                kind: 'numerical_data',
                purpose: 'Inspect the supplied values.',
                acquisitionBrief: 'Use the provided synthetic values; do not fetch replacement data.',
                dataNeeds: [],
                providedEvidenceRefs: [source],
                illustrativeAllowed: false,
                required: true
            }
        ],
        contractChangeNotes: []
    }
}
function block(id = 'blk_values', capabilityId = 'data_table') {
    return {
        id,
        capabilityId,
        representationVariant: '',
        purpose: 'Compare the given values to test proportionality.',
        learnerAction: 'Calculate a ratio and explain the inference.',
        resourceIds: ['res_values'],
        anchor: {
            whatToNotice: 'The same ratio in each supplied pair.',
            connectionToExplanation: 'A rising trend alone is not sufficient.'
        },
        fallback: { capabilityId: 'prose', condition: 'Use the same given values in readable prose if the table cannot render.' },
        assessmentMode: 'none',
        subtopicId: null
    }
}
function compile(plan, ctx = context, extra = {}) {
    return compilePlan(plan, { context: ctx, catalogue, subjectId: ctx.subjectId, ...extra })
}
function makeQuestion(plan) {
    plan.resources.push({
        id: 'res_canonical',
        kind: 'canonical_subtopic',
        purpose: 'Resolve the exact subject subtopic before assessed authoring.',
        acquisitionBrief: 'Use canonical lookup, with ambiguity/no-match blocking.',
        dataNeeds: ['canonical positive subtopic ID'],
        providedEvidenceRefs: [],
        illustrativeAllowed: false,
        required: true
    })
    const b = plan.sections[0].blocks[0]
    b.capabilityId = 'question'
    b.assessmentMode = 'explicit_submit'
    b.resourceIds = ['res_canonical']
    return plan
}

test('new versioned catalogue preserves original protected maxima and permits prose without count padding', () => {
    const plan = basePlan()
    plan.sections.forEach((s) => (s.blocks = []))
    const out = compile(plan)
    assert.equal(out.validation.valid, true)
    assert.equal(out.legacyPlan.token_count, 0)
    assert.equal(out.plan.sections.flatMap((s) => s.blocks).length, 0)
    assert.equal(out.contract.token_min, 0)
    assert.equal(out.contract.token_max, catalogue.playbookCatalogue.find((p) => p.id === plan.choice.playbookId).tokenMax)
    assert.equal(out.contract.playbook_version, '2.0.0')
})
test('Toby advice cannot acquire explicit student format provenance', () => {
    const ctx = { ...copy(context), requestedDocumentType: { value: 'revision pack', provenance: { source: 'toby', explicit: true } } }
    const plan = basePlan(ctx)
    plan.choice.requestedTypeStatus = 'honoured'
    const out = compile(plan, ctx)
    assert.equal(out.validation.valid, true)
    assert.equal(out.plan.choice.requestedTypeStatus, 'absent')
    assert.equal(out.legacyPlan.content_provenance.explicitStudentDocumentType, null)
})
test('an explicit student format is preserved rather than inferred from Toby advice', () => {
    const ctx = {
        ...copy(context),
        requestedDocumentType: { value: 'source analysis page', provenance: { source: 'student', explicit: true } }
    }
    const plan = basePlan(ctx)
    plan.choice.requestedTypeStatus = 'honoured'
    const out = compile(plan, ctx)
    assert.equal(out.validation.valid, true)
    assert.equal(out.legacyPlan.content_provenance.explicitStudentDocumentType, 'source analysis page')
})
test('a declared unsatisfied genuine student format blocks publication while retaining its conflict rationale', () => {
    const ctx = {
        ...copy(context),
        studentRequest: 'Please make a source analysis page.',
        requestedDocumentType: {
            value: 'source analysis page',
            provenance: { source: 'student', explicit: true, quote: 'Please make a source analysis page.' }
        }
    }
    const plan = basePlan(ctx)
    plan.choice.requestedTypeStatus = 'cannot_satisfy'
    plan.choice.rationale =
        'The requested format conflicts with the supplied contract; ask the student to choose an alternative before authoring a different document.'
    const out = compile(plan, ctx)
    assert.equal(out.plan.choice.requestedTypeStatus, 'cannot_satisfy')
    assert.equal(out.plan.choice.rationale, plan.choice.rationale)
    assert.equal(out.publicationAllowed, false)
    assert.equal(out.validation.publicationAllowed, false)
})
test('invented evidence references fail even when the resource ID is declared', () => {
    const plan = basePlan()
    plan.resources[0].providedEvidenceRefs = ['unseen_source']
    const out = compile(plan)
    assert.equal(out.validation.valid, false)
    assert.equal(out.publicationAllowed, false)
    assert.ok(out.validation.errors.includes('unbound_evidence_reference:unseen_source'))
})
test('verified non-empty acquired evidence can bind an exact reference; unverified or empty content cannot', () => {
    const plan = basePlan()
    plan.resources[0].providedEvidenceRefs = ['acquired_exact']
    const good = compile(plan, context, {
        evidence: [{ evidence_id: 'acquired_exact', verified: true, result: { text: 'Actual bounded source text.' } }]
    })
    assert.equal(good.validation.valid, true)
    for (const evidence of [
        [{ evidence_id: 'acquired_exact', verified: false, result: { text: 'Unread.' } }],
        [{ evidence_id: 'acquired_exact', verified: true, result: {} }]
    ])
        assert.equal(compile(plan, context, { evidence }).publicationAllowed, false)
})
test('Combined Science uses the canonical subject ID and requires Foundation including when tier is absent', () => {
    const ctx = fixtures.cases.find((c) => c.id === 'H-COMB-01').context
    assert.equal(compile(basePlan(ctx), ctx).validation.valid, true)
    for (const tier of ['Higher', null]) {
        const bad = copy(ctx)
        bad.contextSignals.curriculum.tier = tier
        const out = compile(basePlan(bad), bad)
        assert.equal(out.validation.valid, false)
        assert.equal(out.publicationAllowed, false)
        assert.ok(out.validation.errors.includes('combined_science_requires_foundation'))
    }
})
test('canonical resolution can permit planning while blocking assessed authoring/publication', () => {
    const ctx = { ...copy(context), assessmentIntent: 'tracked_question_block' }
    const plan = makeQuestion(basePlan(ctx))
    const out = compile(plan, ctx)
    assert.equal(out.validation.valid, true)
    assert.equal(out.publicationAllowed, false)
    assert.equal(out.plan.sections[0].blocks[0].capabilityId, 'question')
    assert.equal(out.plan.sections[0].blocks[0].subtopicId, null)
    assert.ok(out.validation.warnings.includes('publication_blocked_until_canonical_resolution'))
})
test('trusted canonical resolution copies the ID in code; a conflicting model ID is rejected', () => {
    const ctx = { ...copy(context), assessmentIntent: 'tracked_question_block' }
    const resolution = {
        verified: true,
        state: 'verified_exact',
        subtopic_id: 900001,
        subject_id: ctx.subjectId,
        resolution_hash: 'synthetic-local-resolution-only'
    }
    const plan = makeQuestion(basePlan(ctx))
    const out = compile(plan, ctx, { resolution })
    assert.equal(out.validation.valid, true)
    assert.equal(out.publicationAllowed, true)
    assert.equal(out.plan.sections[0].blocks[0].subtopicId, 900001)
    assert.equal(plan.sections[0].blocks[0].subtopicId, null, 'Compiler must not mutate the model input.')
    const conflict = copy(plan)
    conflict.sections[0].blocks[0].subtopicId = 900002
    assert.equal(compile(conflict, ctx, { resolution }).publicationAllowed, false)
    const wrongSubject = { ...resolution, subject_id: 'subj-biology' }
    assert.equal(compile(plan, ctx, { resolution: wrongSubject }).publicationAllowed, false)
})
test('Question authoring requires explicit assessment intent and exploration cannot impersonate submission', () => {
    assert.equal(compile(makeQuestion(basePlan())).publicationAllowed, false)
    const plan = basePlan()
    plan.sections[0].blocks[0].assessmentMode = 'explicit_submit'
    assert.equal(compile(plan).publicationAllowed, false)
})
test('M01 one-over selected maximum fails; a repaired plan must fit without widening the contract', () => {
    const plan = basePlan()
    const max = catalogue.playbookCatalogue.find((p) => p.id === plan.choice.playbookId).tokenMax
    plan.sections[0].blocks = Array.from({ length: max + 1 }, (_, i) => block('blk_' + i))
    const before = copy(plan)
    const out = compile(plan)
    assert.equal(out.validation.valid, false)
    assert.equal(out.publicationAllowed, false)
    assert.equal(out.contract.token_max, max)
    assert.deepEqual(plan, before)
    const repaired = copy(plan)
    repaired.sections[0].blocks.pop()
    const pass = compile(repaired)
    assert.equal(pass.validation.valid, true)
    assert.equal(pass.contract.token_max, max)
    assert.equal(pass.legacyPlan.token_count, max)
})
test('required evidence beyond the acquisition budget fails instead of disappearing silently', () => {
    const plan = basePlan()
    plan.resources = Array.from({ length: 7 }, (_, i) => ({
        id: 'source_' + i,
        kind: 'source',
        purpose: 'Required source ' + i,
        acquisitionBrief: 'Resolve exact source ' + i,
        dataNeeds: [],
        providedEvidenceRefs: [],
        illustrativeAllowed: false,
        required: true
    }))
    plan.sections[0].blocks[0].resourceIds = ['source_0']
    const out = compile(plan)
    assert.equal(out.validation.valid, false)
    assert.equal(out.publicationAllowed, false)
    assert.ok(out.validation.errors.includes('evidence_request_budget_exceeded'))
})
test('PDF resources remain optional and cannot become a core requirement', () => {
    const plan = basePlan()
    plan.resources.push({
        id: 'pdf_optional',
        kind: 'document',
        purpose: 'Optional extension.',
        acquisitionBrief: 'Read actual selected content before review.',
        dataNeeds: [],
        providedEvidenceRefs: [],
        illustrativeAllowed: false,
        required: false
    })
    assert.equal(compile(plan).validation.valid, true)
    plan.resources.at(-1).required = true
    assert.equal(compile(plan).publicationAllowed, false)
})
