/** Pure, fail-closed configuration transform. It performs no I/O or API calls. */
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'

export const REFERENCE_PARENT_ID = '076230ec-507b-4e7f-a100-512c3e53d032'
export const PRODUCTION_PARENT_ID = '0109979c-e23d-42b8-b87f-411ce36b5940'
export const GEOGRAPHY_BUILDER_ID = '13bb79b6-be3f-4cb2-9765-b17f6332ab6a'
export const VALIDATOR_NODE_ID = 'customFunctionAgentflow_validate'
export const EXPECTED_BUILDER_FLOW_SHA256 = 'bc57aaee20c1ad7f887f739c83dda2099c4ac4b33b7d16dfb990332ade4cac5a'
export const EXPECTED_VALIDATOR_SHA256 = 'e087b305838a25b8a1a792210b0e51cfd8a858c0665ddcf813359769f53401bf'
export const ORIGINAL_PARENT_GUARD = "clean(incoming.parentChatflowId) !== '" + REFERENCE_PARENT_ID + "'"
export const REPAIRED_PARENT_GUARD =
    "!['" + REFERENCE_PARENT_ID + "','" + PRODUCTION_PARENT_ID + "'].includes(clean(incoming.parentChatflowId))"

const digest = (text) => createHash('sha256').update(text).digest('hex')
const count = (text, needle) => text.split(needle).length - 1
const sourceFields = ['customFunctionJavascriptFunction', 'code']

export function repairGeographyCanvasValidatorSource(source) {
    assert.equal(typeof source, 'string', 'Missing validator source')
    assert.equal(digest(source), EXPECTED_VALIDATOR_SHA256, 'Validator source changed')
    assert.equal(count(source, ORIGINAL_PARENT_GUARD), 1, 'Expected one exact parent guard')
    return source.replace(ORIGINAL_PARENT_GUARD, REPAIRED_PARENT_GUARD)
}

/** Preserve every byte except the exact parent predicate in both mirrored validator source fields. */
export function buildGeographyCanvasBuilderCandidate(record) {
    assert.equal(record?.id, GEOGRAPHY_BUILDER_ID, 'Unexpected Canvas builder')
    assert.equal(typeof record.flowData, 'string', 'Missing builder flowData')
    assert.equal(digest(record.flowData), EXPECTED_BUILDER_FLOW_SHA256, 'Builder configuration changed; refresh and review the baseline')

    const graph = JSON.parse(record.flowData)
    assert(Array.isArray(graph.nodes) && Array.isArray(graph.edges), 'Malformed Canvas graph')
    const validators = graph.nodes.filter((node) => node.id === VALIDATOR_NODE_ID)
    assert.equal(validators.length, 1, 'Expected one Canvas validator')
    const inputs = validators[0]?.data?.inputs
    assert.equal(validators[0]?.data?.name, 'customFunctionAgentflow', 'Unexpected validator node type')
    for (const field of sourceFields) {
        inputs[field] = repairGeographyCanvasValidatorSource(inputs?.[field])
    }

    // Guard text contains no JSON escapes. Replace only its two reviewed occurrences
    // so formatting and every unrelated source/credential/configuration byte stay identical.
    assert.equal(count(record.flowData, ORIGINAL_PARENT_GUARD), sourceFields.length, 'Parent guard occurs outside the validator')
    const flowData = record.flowData.replaceAll(ORIGINAL_PARENT_GUARD, REPAIRED_PARENT_GUARD)
    assert.deepEqual(JSON.parse(flowData), graph, 'Unrelated graph change')
    assert.equal(flowData.replaceAll(REPAIRED_PARENT_GUARD, ORIGINAL_PARENT_GUARD), record.flowData, 'Unrelated byte change')

    return {
        payload: { flowData },
        receipt: {
            schema: 'TobyGeographyCanvasBuilderRepair@1.0',
            builderId: GEOGRAPHY_BUILDER_ID,
            allowedParentIds: [REFERENCE_PARENT_ID, PRODUCTION_PARENT_ID],
            subjectId: 'subj-geography',
            beforeFlowDataSha256: EXPECTED_BUILDER_FLOW_SHA256,
            afterFlowDataSha256: digest(flowData),
            beforeValidatorSha256: EXPECTED_VALIDATOR_SHA256,
            afterValidatorSha256: digest(inputs.code),
            changedFields: sourceFields.map((field) => 'nodes/' + VALIDATOR_NODE_ID + '/data/inputs/' + field),
            unrelatedBytesPreserved: true,
            payloadKeys: ['flowData']
        }
    }
}
