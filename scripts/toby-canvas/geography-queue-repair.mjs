import assert from 'node:assert/strict';

export const PRODUCTION_GEOGRAPHY_PARENT = '0109979c-e23d-42b8-b87f-411ce36b5940';
export const REFERENCE_GEOGRAPHY_PARENT = '076230ec-507b-4e7f-a100-512c3e53d032';
export const REFERENCE_QUEUE_TOOL = '3e7d6768-f1a3-4c3e-a434-c1ef4df46b89';
export const PRODUCTION_QUEUE_DB_NAME = 'queue_canvas_build_geography_teach_me_010_v2';
export const CANONICAL_QUEUE_TOOL_NAME = 'queue_canvas_build_v2';
export const QUEUE_TOOL_ID_PLACEHOLDER = '__QUEUE010_TOOL_ID_AFTER_CREATE__';

function replaceOnce(source, before, after) {
  assert.equal(source.split(before).length - 1, 1, 'Expected one reviewed source anchor');
  return source.replace(before, after);
}

export function buildGeographyCanvasQueueCandidate(reference) {
  assert.equal(reference.id, REFERENCE_QUEUE_TOOL, 'Unexpected reference queue tool');
  assert.equal(reference.name, CANONICAL_QUEUE_TOOL_NAME, 'Unexpected reference queue name');
  assert.equal(typeof reference.func, 'string');
  let func = replaceOnce(reference.func,
    `parentChatflowId: '${REFERENCE_GEOGRAPHY_PARENT}',`,
    `parentChatflowId: '${PRODUCTION_GEOGRAPHY_PARENT}',`);
  func = replaceOnce(func,
    `if(flow.chatflowId&&flow.chatflowId!=='${REFERENCE_GEOGRAPHY_PARENT}')`,
    `if(flow.chatflowId!=='${PRODUCTION_GEOGRAPHY_PARENT}')`);

  // The current protected request owns publication preference. Generic destination
  // normalization must never remove an explicit chat-only / no-Canvas instruction.
  const destinationGuard = `const protectedCanvasRequest = typeof flow.input === 'string' ? flow.input : '';
// A negated Canvas artifact (for example Canvas mindmap) is not a refusal of
// Canvas publication. Require the destination or generic doc/document phrase to
// end there or be followed by a destination qualifier, never another artifact.
const genericCanvasTail = String.raw\`canvas(?:\\s+(?:doc|document))?\\b(?=\\s*(?:$|[.!?;,\\n]|(?:please|for|today|now|yet|anymore|because|as|since|so|instead|at\\s+all)\\b))\`;
const canvasPublicationDeclined = /\\bchat[\\s-]+only\\b/i.test(protectedCanvasRequest)
  || /\\b(?:do\\s+not|don['’]?t|dont|never)\\s+(?:send|put|publish|add|place)\\b[^.!?;,\\n]{0,160}\\b(?:to|on|in|onto|into)\\s+(?:(?:the|my)\\s+)?canvas\\b/i.test(protectedCanvasRequest)
  || new RegExp(String.raw\`\\b(?:do\\s+not|don['’]?t|dont|never)\\s+(?:send|put|publish|add|place|create|make|build|generate|prepare|produce|write)\\b[^.!?;,\\n]{0,160}\\b\` + genericCanvasTail, 'i').test(protectedCanvasRequest)
  || /\\b(?:no|not|without)\\s+(?:to|on|in|onto|into)\\s+(?:(?:the|my)\\s+)?canvas\\b/i.test(protectedCanvasRequest)
  || new RegExp(String.raw\`\\b(?:no|not|without)\\s+(?:(?:to|on|in|onto|into)\\s+)?(?:(?:the|my|a|an)\\s+)?\` + genericCanvasTail, 'i').test(protectedCanvasRequest);
if (canvasPublicationDeclined) return rejectBrief('canvas_publication_declined');
// These three exact phrases identify a destination, not a student-selected format.
// Preserve every other format phrase, including artifact names containing Canvas.
const genericCanvasDestination = typeof input.explicitStudentDocumentType === 'string'
  && /^(?:canvas|canvas doc|canvas document)$/i.test(input.explicitStudentDocumentType.trim().replace(/\\s+/g, ' '));
if (genericCanvasDestination) {
  input.explicitStudentDocumentType = undefined;
  input.exactStudentRequestQuote = undefined;
}
`;
  func = replaceOnce(func, 'let requestedDocumentType = null;', destinationGuard + 'let requestedDocumentType = null;');

  const schema = JSON.parse(reference.schema);
  assert(Array.isArray(schema));
  const format = schema.find(field => field.property === 'explicitStudentDocumentType');
  const quote = schema.find(field => field.property === 'exactStudentRequestQuote');
  assert(format && quote && format.required === false && quote.required === false,
    'Student format fields must remain optional');
  format.description = 'Optional exact document-format phrase explicitly chosen by the CURRENT student, such as flashcards or a revision sheet. Canvas, Canvas doc and Canvas document name the destination, not a format: omit both optional format fields for those generic requests and let the Canvas agent choose the formation. Supply together with exactStudentRequestQuote only for a genuine student-selected format. Never infer a format from Toby preferences, discussion, negation or an older request.';
  quote.description = 'Optional exact verbatim excerpt of the CURRENT student request containing a genuine student-selected format and its explicit creation request. Supply only with explicitStudentDocumentType. Omit both fields for generic Canvas, Canvas doc or Canvas document destination requests. The tool verifies current flow.input, negation and explicit creation; never invent or paraphrase the quote.';

  const candidate = Object.fromEntries(['name', 'description', 'color', 'iconSrc', 'schema', 'func']
    .filter(key => key in reference).map(key => [key, reference[key]]));
  candidate.name = PRODUCTION_QUEUE_DB_NAME;
  candidate.description = reference.description + '\nFor production Geography Teach Me only. Generic Canvas, Canvas doc and Canvas document requests select the destination: omit the optional explicitStudentDocumentType/exactStudentRequestQuote pair and let the agent choose the formation. Preserve genuine student-chosen format provenance. Never queue against an explicit chat-only or no-Canvas request.';
  candidate.schema = JSON.stringify(schema);
  candidate.func = func;
  return candidate;
}

export function buildGeographyParentQueueBinding(record, queueToolId = QUEUE_TOOL_ID_PLACEHOLDER) {
  assert.equal(record.id, PRODUCTION_GEOGRAPHY_PARENT);
  assert(queueToolId === QUEUE_TOOL_ID_PLACEHOLDER
    || (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(queueToolId)
      && queueToolId !== REFERENCE_QUEUE_TOOL), 'Use the new API-assigned queue tool ID');
  const graph = JSON.parse(record.flowData);
  const node = graph.nodes.find(candidate => candidate.id === 'customTool_queue_canvas_build_v1');
  assert.equal(node?.data?.inputs?.selectedTool, REFERENCE_QUEUE_TOOL);
  assert.equal(node.data.inputs.customToolName, '');
  node.data.inputs.selectedTool = queueToolId;
  // A distinct stored tool name isolates the shared resource. The model continues
  // seeing the canonical name already used throughout the protected parent prompt.
  node.data.inputs.customToolName = CANONICAL_QUEUE_TOOL_NAME;
  return {flowData: JSON.stringify(graph)};
}
