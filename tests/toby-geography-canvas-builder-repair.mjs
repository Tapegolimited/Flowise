/** Real validator contract fixture; synthetic data only, no network or SDK dependencies. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import {
    REFERENCE_PARENT_ID, PRODUCTION_PARENT_ID, GEOGRAPHY_BUILDER_ID,
    repairGeographyCanvasValidatorSource, buildGeographyCanvasBuilderCandidate
} from '../scripts/toby-canvas/geography-builder-repair.mjs'

const original = readFileSync(new URL('./fixtures/toby-geography-canvas-validator.txt', import.meta.url), 'utf8')
const repaired = repairGeographyCanvasValidatorSource(original)
let checks = 0
function expectCode(label, envelope, expected, source = repaired, runtime = {}) {
    const result = vm.runInNewContext('(function(){' + source + '})()', {
        Buffer, $webhookBody: envelope,
        $flow: { sessionId: envelope.agentflowSessionId, state: {}, ...runtime }
    })
    assert.equal(result.validationCode, expected, label)
    checks++
}
function envelope(parent = PRODUCTION_PARENT_ID) {
    const session = 'synthetic-owned-session'
    const agentSession = session + ':canvas:synthetic-operation'
    return {
        schemaVersion: '1.0', operationId: 'synthetic-operation',
        parentChatflowId: parent, parentSessionId: session, agentflowSessionId: agentSession,
        chatId: agentSession, sessionId: agentSession,
        documentBrief: {
            objective: 'Explain a river process', outcome: 'Explain it independently',
            scopeQuery: 'river process', substantiveContent: 'Synthetic teaching content.',
            assessmentIntent: 'none', continuationIntent: 'new', requestedDocumentType: null,
            planningSuggestions: [{ suggestion: 'Compare the process stages', status: 'advisory' }]
        },
        runtimeContext: {
            sessionId: session, userID: '160', subjectId: 'subj-geography',
            currentLearnerRequest: 'Please create a mindmap about rivers.'
        },
        memoryScope: { valid: false }
    }
}

expectCode('Original validator rejects the production parent', envelope(), 'invalid_parent_chatflow', original)
expectCode('Repaired validator accepts production Geography', envelope(), 'accepted')
expectCode('Reference test parent remains accepted', envelope(REFERENCE_PARENT_ID), 'accepted')
for (const parent of ['', 'foreign-parent', PRODUCTION_PARENT_ID + '-copy', PRODUCTION_PARENT_ID.toUpperCase()]) {
    expectCode('Unknown or inexact parent rejected', envelope(parent), 'invalid_parent_chatflow')
}
for (const subject of ['', 'subj-higher-maths', 'subj-biology']) {
    const body = envelope()
    body.runtimeContext.subjectId = subject
    expectCode('Subject scope is preserved', body, subject === '' ? 'missing_subject_id' : 'subject_scope_mismatch')
}
const sessionMismatch = envelope()
sessionMismatch.runtimeContext.sessionId = 'synthetic-other-session'
expectCode('Parent ownership session binding retained', sessionMismatch, 'session_scope_mismatch')
const chatMismatch = envelope()
chatMismatch.chatId = 'synthetic-other-chat'
expectCode('Agent chat binding retained', chatMismatch, 'agentflow_session_mismatch')
expectCode('Runtime agent session binding retained', envelope(), 'runtime_agentflow_session_mismatch', repaired, { sessionId: 'synthetic-other-agent-session' })
const noUser = envelope()
noUser.runtimeContext.userID = ''
expectCode('Protected learner scope required', noUser, 'missing_user_id')
const noOperation = envelope()
noOperation.operationId = ''
expectCode('Operation identity required', noOperation, 'missing_session_scope')
const tooLarge = envelope()
tooLarge.documentBrief.substantiveContent = 'x'.repeat(17000)
expectCode('Envelope size bound retained', tooLarge, 'context_too_large')
const badSchema = envelope()
badSchema.schemaVersion = '2.0'
expectCode('Existing schema version retained', badSchema, 'unsupported_schema_version')
const absentContent = envelope()
absentContent.documentBrief.substantiveContent = ''
expectCode('Source content required', absentContent, 'missing_required_input')
const badAssessment = envelope()
badAssessment.documentBrief.assessmentIntent = 'award_points'
expectCode('Assessment intent allowlist retained', badAssessment, 'invalid_assessment_intent')
const badContinuation = envelope()
badContinuation.documentBrief.continuationIntent = 'overwrite'
expectCode('Append-only continuation allowlist retained', badContinuation, 'invalid_continuation_intent')
expectCode('Duplicate operation protection retained', envelope(), 'duplicate_operation', repaired, { state: { operationId: 'synthetic-operation', operationStatus: 'sent' } })
const genuineFormat = envelope()
genuineFormat.documentBrief.requestedDocumentType = {
    value: 'mindmap', provenance: { source: 'student', explicit: true, quote: 'Please create a mindmap about rivers.' }
}
expectCode('Verified genuine current student format retained', genuineFormat, 'accepted')
const wrongQuote = structuredClone(genuineFormat)
wrongQuote.documentBrief.requestedDocumentType.provenance.quote = 'Please create a worksheet.'
expectCode('Invented or stale quote remains invalid', wrongQuote, 'invalid_explicit_student_format')
const inferredFormat = structuredClone(genuineFormat)
inferredFormat.documentBrief.requestedDocumentType.provenance.source = 'toby'
expectCode('Model-inferred format remains invalid', inferredFormat, 'invalid_explicit_student_format')
assert.throws(() => repairGeographyCanvasValidatorSource(original.replace("'subj-geography'", "'subj-biology'")), /Validator source changed/)
checks++
assert.throws(() => repairGeographyCanvasValidatorSource(repaired), /Validator source changed/)
checks++
assert.throws(() => buildGeographyCanvasBuilderCandidate({ id: 'foreign-builder', flowData: '{}' }), /Unexpected Canvas builder/)
checks++
assert.throws(() => buildGeographyCanvasBuilderCandidate({ id: GEOGRAPHY_BUILDER_ID, flowData: '{}' }), /configuration changed/)
checks++
console.log(JSON.stringify({ passed: true, checks, networkCalls: 0, predictions: 0, scope: 'builder validator contract' }))
