/** Actual reviewed queue code with a synthetic endpoint; inputs and dependencies are offline stubs. */
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash, createHmac} from 'node:crypto';
import * as crypto from 'node:crypto';
import {
  buildGeographyCanvasQueueCandidate, buildGeographyParentQueueBinding,
  PRODUCTION_GEOGRAPHY_PARENT, REFERENCE_GEOGRAPHY_PARENT,
  CANONICAL_QUEUE_TOOL_NAME, PRODUCTION_QUEUE_DB_NAME, QUEUE_TOOL_ID_PLACEHOLDER,
} from '../scripts/toby-canvas/geography-queue-repair.mjs';

const read = name => JSON.parse(readFileSync(new URL(name, import.meta.url)));
const reference = { ...read('./fixtures/toby-geography-canvas-queue.json'),
  func: readFileSync(new URL('./fixtures/toby-geography-canvas-queue-function.txt', import.meta.url), 'utf8') };
const parent = read('./fixtures/toby-geography-canvas-parent.json');
const referenceBytes = JSON.stringify(reference);
const parentBytes = JSON.stringify(parent);
const candidate = buildGeographyCanvasQueueCandidate(reference);
const schema = JSON.parse(candidate.schema);
const properties = schema.map(field => field.property);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const callable = new AsyncFunction('require', '$flow', '$vars', ...properties.map(key => '$' + key), candidate.func);
const baseInput = {
  objective: 'Understand coastal erosion', outcome: 'A clear durable teaching document',
  scopeQuery: 'coastal erosion', substantiveContent: 'Hydraulic action and abrasion erode coasts. Compare the processes using this supplied content.',
  planningSuggestions: '[]', assessmentIntent: 'none', questionCount: 0, continuationIntent: 'new',
};
const baseVars = {
  tobyCanvasAgentflowQueueEnabled: 'true', sessionId: 'synthetic-owned-session', userID: '160',
  subjectId: 'subj-geography', tobyCanvasAgentflowWebhookSecret: 'synthetic-signing-secret',
  tutorTodayMemoryBridgeToken: 'synthetic-memory-token',
};

async function execute({input = {}, request = 'Canvas document for coastal erosion.', flow = {}, vars = {}} = {}) {
  const calls = [];
  const stubFetch = async (_url, options) => {
    calls.push({options, envelope: JSON.parse(options.body)});
    return {status: 202, text: async () => JSON.stringify({status: 'PROCESSING'})};
  };
  const stubRequire = name => {
    if (name === 'node-fetch') return stubFetch;
    if (name === 'crypto') return crypto;
    throw new Error('Unexpected sandbox dependency');
  };
  const args = {...baseInput, ...input};
  const result = JSON.parse(await callable(stubRequire,
    {chatflowId: PRODUCTION_GEOGRAPHY_PARENT, sessionId: baseVars.sessionId, input: request, ...flow},
    {...baseVars, ...vars}, ...properties.map(key => args[key])));
  return {result, calls};
}

test('dedicated tool is isolated and keeps the original shared records unchanged', () => {
  assert.equal(candidate.name, PRODUCTION_QUEUE_DB_NAME);
  assert.equal('id' in candidate, false);
  assert.equal('createdDate' in candidate, false);
  assert.equal('workspaceId' in candidate, false);
  assert.equal(JSON.stringify(reference), referenceBytes);
  assert.equal(JSON.stringify(parent), parentBytes);
  assert.equal(schema.find(field => field.property === 'explicitStudentDocumentType').required, false);
  assert.equal(schema.find(field => field.property === 'exactStudentRequestQuote').required, false);
  assert.equal(candidate.color, reference.color);
  assert.equal(candidate.iconSrc, reference.iconSrc);
});

test('parent binding changes only selected ID and canonical visible tool alias', () => {
  const update = buildGeographyParentQueueBinding(parent);
  assert.deepEqual(Object.keys(update), ['flowData']);
  const before = JSON.parse(parent.flowData), after = JSON.parse(update.flowData);
  const queue = after.nodes.find(node => node.id === 'customTool_queue_canvas_build_v1');
  assert.equal(queue.data.inputs.selectedTool, QUEUE_TOOL_ID_PLACEHOLDER);
  assert.equal(queue.data.inputs.customToolName, CANONICAL_QUEUE_TOOL_NAME);
  queue.data.inputs.selectedTool = before.nodes.find(node => node.id === queue.id).data.inputs.selectedTool;
  queue.data.inputs.customToolName = '';
  assert.equal(JSON.stringify(after) === JSON.stringify(before), true, 'All other nodes, fields, edges and prompts must match');
});

for (const destination of ['Canvas', 'Canvas doc', 'Canvas document', ' CANVAS   DOC ']) {
  test('generic destination clears optional format pair: ' + destination, async () => {
    const {result, calls} = await execute({input: {
      explicitStudentDocumentType: destination, exactStudentRequestQuote: 'Canvas document for coastal erosion.',
    }});
    assert.equal(result.code, 'canvas_build_queued');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].envelope.documentBrief.requestedDocumentType, null);
    assert.equal(calls[0].envelope.parentChatflowId, PRODUCTION_GEOGRAPHY_PARENT);
  });
}

for (const input of [{}, {explicitStudentDocumentType: '', exactStudentRequestQuote: ''}]) {
  test('omitted or empty optional pair allows automatic formation', async () => {
    const {result, calls} = await execute({input});
    assert.equal(result.code, 'canvas_build_queued');
    assert.equal(calls[0].envelope.documentBrief.requestedDocumentType, null);
  });
}

test('genuine exact current student format preserves provenance', async () => {
  const request = 'Create flashcards explaining coastal erosion.';
  const {result, calls} = await execute({request, input: {
    explicitStudentDocumentType: 'flashcards', exactStudentRequestQuote: request,
  }});
  assert.equal(result.code, 'canvas_build_queued');
  assert.equal(calls[0].envelope.documentBrief.requestedDocumentType.value, 'flashcards');
  assert.equal(calls[0].envelope.documentBrief.requestedDocumentType.provenance.quote, request);
  assert.equal(calls[0].envelope.documentBrief.requestedDocumentType.provenance.explicit, true);
});

test('genuine artifact phrase containing Canvas is never stripped', async () => {
  const request = 'Create flashcards for Canvas about coastal erosion.';
  const {result, calls} = await execute({request, input: {
    explicitStudentDocumentType: 'flashcards for Canvas', exactStudentRequestQuote: request,
  }});
  assert.equal(result.code, 'canvas_build_queued');
  assert.equal(calls[0].envelope.documentBrief.requestedDocumentType.value, 'flashcards for Canvas');
});

test('genuine format without explicit creation retains existing rejection', async () => {
  const request = 'Flashcards about coastal erosion.';
  const {result, calls} = await execute({request, input: {
    explicitStudentDocumentType: 'flashcards', exactStudentRequestQuote: request,
  }});
  assert.equal(result.code, 'student_format_not_explicit');
  assert.equal(calls.length, 0);
});

test('fabricated or stale format quote retains existing rejection', async () => {
  const {result, calls} = await execute({request: 'Create a summary of coastal erosion.', input: {
    explicitStudentDocumentType: 'flashcards', exactStudentRequestQuote: 'Create flashcards of coastal erosion.',
  }});
  assert.equal(result.code, 'student_quote_not_current');
  assert.equal(calls.length, 0);
});

test('negated genuine format retains existing format guard', async () => {
  const {result, calls} = await execute({request: 'Do not make flashcards; create a plain Canvas document.', input: {
    explicitStudentDocumentType: 'flashcards', exactStudentRequestQuote: 'Do not make flashcards',
  }});
  assert.equal(result.code, 'student_format_negated_or_ambiguous');
  assert.equal(calls.length, 0);
});

for (const request of [
  'Chat only: explain coastal erosion.', 'Keep this chat-only.', 'Do not send this to Canvas.',
  "Don't put this on Canvas.", 'Never publish this to Canvas.', 'No Canvas for this.', 'Explain this without Canvas.',
]) {
  for (const input of [{}, {explicitStudentDocumentType: 'Canvas doc', exactStudentRequestQuote: request}]) {
    test('protected publication denial blocks before fetch, with omitted or generic pair: ' + request, async () => {
      const {result, calls} = await execute({request, input});
      assert.equal(result.code, 'canvas_publication_declined');
      assert.equal(calls.length, 0);
    });
  }
}

test('dedicated queue refuses reference, unknown or missing parents', async () => {
  for (const chatflowId of [REFERENCE_GEOGRAPHY_PARENT, '00000000-0000-4000-8000-000000000000', undefined]) {
    const {result, calls} = await execute({flow: {chatflowId}});
    assert.equal(result.code, 'parent_scope_mismatch');
    assert.equal(calls.length, 0);
  }
});

test('subject, session and enablement fences remain effective', async () => {
  for (const [options, code] of [
    [{vars: {subjectId: 'subj-maths'}}, 'subject_scope_mismatch'],
    [{vars: {sessionId: 'another-session'}}, 'session_scope_mismatch'],
    [{vars: {tobyCanvasAgentflowQueueEnabled: 'false'}}, 'canvas_agentflow_queue_disabled'],
  ]) {
    const {result, calls} = await execute(options);
    assert.equal(result.code, code);
    assert.equal(calls.length, 0);
  }
});

test('one existing endpoint send retains timeout, exact HMAC body and runtime-owned scope', async () => {
  const {result, calls} = await execute();
  assert.equal(result.code, 'canvas_build_queued');
  assert.equal(calls.length, 1);
  const {options, envelope} = calls[0];
  assert.equal(options.timeout, 1900);
  assert.equal(options.method, 'POST');
  assert.equal(options.headers['X-Toby-Canvas-Signature'], 'sha256=' + createHmac('sha256', baseVars.tobyCanvasAgentflowWebhookSecret).update(options.body).digest('hex'));
  assert.equal(envelope.parentSessionId, baseVars.sessionId);
  assert.equal(envelope.runtimeContext.userID, baseVars.userID);
  assert.equal(envelope.runtimeContext.subjectId, baseVars.subjectId);
  assert.equal(envelope.runtimeContext.sessionId, baseVars.sessionId);
  const urlLiteral = /const webhookUrl = ([^;]+);/;
  const digest = value => createHash('sha256').update(value).digest('hex');
  assert.equal(digest(candidate.func.match(urlLiteral)[1]) === digest(reference.func.match(urlLiteral)[1]), true,
    'Existing queue endpoint remains identical');
});

for (const request of [
  'Do not create a Canvas mindmap; create a revision sheet on Canvas.',
  'Create a revision sheet on Canvas, not a Canvas mindmap.',
]) {
  test('a rejected specific Canvas artifact does not override the selected alternative: ' + request, async () => {
    const {result, calls} = await execute({request, input: {
      explicitStudentDocumentType: 'revision sheet', exactStudentRequestQuote: request,
    }});
    assert.equal(result.code, 'canvas_build_queued');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].envelope.documentBrief.requestedDocumentType.value, 'revision sheet');
    assert.equal(calls[0].envelope.documentBrief.requestedDocumentType.provenance.quote, request);
  });
}

for (const request of [
  'Do not create a Canvas document.', 'No Canvas please.',
  'Create a revision sheet here, not on Canvas.', 'Chat only. Create a revision sheet.',
]) {
  test('explicit destination denial still refuses a genuine selected format: ' + request, async () => {
    const {result, calls} = await execute({request, input: {
      explicitStudentDocumentType: 'revision sheet', exactStudentRequestQuote: request,
    }});
    assert.equal(result.code, 'canvas_publication_declined');
    assert.equal(calls.length, 0);
  });
}

test('a genuinely negated Canvas artifact retains the original format rejection', async () => {
  const request = 'Do not create a Canvas mindmap; create a revision sheet on Canvas.';
  const {result, calls} = await execute({request, input: {
    explicitStudentDocumentType: 'mindmap', exactStudentRequestQuote: request,
  }});
  assert.equal(result.code, 'student_format_negated_or_ambiguous');
  assert.equal(calls.length, 0);
});

for (const request of [
  'Do not send this to Canvas because I only want it here.',
  'Create a revision sheet, not on Canvas because I want it in chat.',
  'Create a revision sheet here, not on Canvas under any circumstances.',
]) {
  test('a publication-denial clause preserves explanatory tails: ' + request, async () => {
    const {result, calls} = await execute({request, input: {
      explicitStudentDocumentType: 'revision sheet', exactStudentRequestQuote: request,
    }});
    assert.equal(result.code, 'canvas_publication_declined');
    assert.equal(calls.length, 0);
  });
}

for (const request of [
  'Do not send this to Canvas under any circumstances.',
  'Never publish this on Canvas while I am editing it.',
  'Do not add this to my Canvas until I ask you.',
]) {
  test('direct publication verbs retain denial independent of explanatory tail: ' + request, async () => {
    const {result, calls} = await execute({request, input: {}});
    assert.equal(result.code, 'canvas_publication_declined');
    assert.equal(calls.length, 0);
  });
}
