/** Pin the reviewed live records before composing the three pure transforms. No I/O or API calls. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { buildGeographyCanvasBuilderCandidate } from './geography-builder-repair.mjs'
import {
    buildGeographyCanvasQueueCandidate, buildGeographyParentQueueBinding,
    PRODUCTION_GEOGRAPHY_PARENT, REFERENCE_QUEUE_TOOL, QUEUE_TOOL_ID_PLACEHOLDER
} from './geography-queue-repair.mjs'

export const EXPECTED_REFERENCE_QUEUE_SHA256 = 'a06e74dd26fcb8a4eca6a7c051728e4e9ab43eade6d04ac01cf965d241ebd8ee'
export const EXPECTED_PRODUCTION_PARENT_SHA256 = '309a16e82a45de37fae5fe9aa89ccadd345b8ac1d3d00545109fb192e5f6ad56'
export const EXPECTED_CANDIDATE_QUEUE_SHA256 = '9c9fc46b2af72c0f0dc3ee20c5b56de76bd5d6d10b2510b9f18108de0355a42d'
const digest = (value) => createHash('sha256').update(value).digest('hex')

export function buildGeographyCanvasRepairPlan({ queue, parent, builder }, newQueueId = QUEUE_TOOL_ID_PLACEHOLDER) {
    assert.equal(queue?.id, REFERENCE_QUEUE_TOOL, 'Unexpected reference queue')
    assert.equal(typeof queue.func, 'string', 'Missing reference queue source')
    assert.equal(digest(queue.func), EXPECTED_REFERENCE_QUEUE_SHA256, 'Reference queue source changed; refresh and review the baseline')
    assert.equal(parent?.id, PRODUCTION_GEOGRAPHY_PARENT, 'Unexpected production parent')
    assert.equal(typeof parent.flowData, 'string', 'Missing production parent graph')
    assert.equal(digest(parent.flowData), EXPECTED_PRODUCTION_PARENT_SHA256, 'Production parent changed; refresh and review the baseline')

    const queuePayload = buildGeographyCanvasQueueCandidate(queue)
    assert.equal(digest(queuePayload.func), EXPECTED_CANDIDATE_QUEUE_SHA256, 'Queue transform no longer matches the reviewed candidate')
    const builderCandidate = buildGeographyCanvasBuilderCandidate(builder)
    const parentPayload = buildGeographyParentQueueBinding(parent, newQueueId)
    return {
        queuePayload,
        builderPayload: builderCandidate.payload,
        parentPayload,
        receipt: {
            schema: 'TobyGeographyCanvasRepairPlan@1.0',
            localPlanOnly: true,
            newQueueId,
            readyForApply: newQueueId !== QUEUE_TOOL_ID_PLACEHOLDER,
            referenceQueueSha256: EXPECTED_REFERENCE_QUEUE_SHA256,
            candidateQueueSha256: EXPECTED_CANDIDATE_QUEUE_SHA256,
            beforeParentFlowDataSha256: EXPECTED_PRODUCTION_PARENT_SHA256,
            candidateParentFlowDataSha256: digest(parentPayload.flowData),
            builder: builderCandidate.receipt,
            apiCalls: 0,
            predictions: 0
        }
    }
}
