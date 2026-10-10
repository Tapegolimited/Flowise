import { buildCandidatePlannerPrompt } from './candidate-planner.mjs'
export function buildEvidenceBoundPlannerPrompt(options) {
    const prompt = buildCandidatePlannerPrompt(options)
    const safeguards = `
Evidence and learning closure policy v2:
Preserve the epistemic status of every supplied item: real source, synthetic teaching fixture, observed measurement, learner belief, assumption or hypothetical example. A learner's assertion is not a measured/source fact. Unknown method, instrument, depth, sampling location, uncertainty, temperature effect, publication detail, syllabus option or measurement interval stays unknown. Do not fill it from a typical textbook investigation. Unreported uncertainty does not mean zero uncertainty, and synthetic data does not establish the absence of heating or error. Inferences must stay within the supplied values and source dates. Keep synthetic material explicitly labelled when used as a source or dataset; it cannot prove an event in the real world.
Make the scope of a classification tree explicit. Excluding one category does not prove another unless the supplied, explicitly restricted candidate set is exhaustive. Include an other/insufficient-information path when needed. Models and diagrams must state the relevant assumption or limitation and what the student must avoid concluding. Do not assert that all real measurements show visible scatter or that a simplified measurement equals a true population/cross-sectional average.
Before closing, account for each substantive source item or task variant supplied in the brief; do not silently omit the changed condition or comparison that develops transfer. For an explanatory, diagnostic or interpretive objective, give the learner an opportunity to produce a short explanation, calculation, revision, evaluation or composition of their own and use the feedback. Recognition MCQs can support this but cannot stand in for the requested learner performance. A student should not merely copy the supplied conclusion or improvement. Keep Smart Homework scaffolded and preserve learner authorship.
Canvas depth policy: the default core document should feel like roughly one and a half readable pages of substantive educational content. Plan enough explanation, developed examples or source interpretation, learner work and synthesis for that depth. Optional PDFs, videos, external reading, padding, repeated summaries and blank spacing do not count toward core depth. Use existing representations only where they teach; do not add tokens to fill space. Keep this planning JSON compact; the renderer writes the fuller content. If an explicit student time/length constraint conflicts with the default depth, flag the conflict for coherent resolution rather than hiding it or padding the document.
`
    prompt.system += '\n' + safeguards
    prompt.messages = [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
    ]
    return prompt
}
