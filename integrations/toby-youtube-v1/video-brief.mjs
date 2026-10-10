// Shared validation for planner output, tool arguments and the native ranker.
export function normalizeVideoBrief(value) {
    try {
        if (typeof value === 'string') value = JSON.parse(value)
    } catch {
        return null
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null
    const purposes = [
        'concept_explanation',
        'process_visualisation',
        'worked_example',
        'practical_demonstration',
        'exam_technique',
        'revision_recap'
    ]
    const formats = ['explanation', 'animation', 'demonstration', 'worked_example', 'exam_walkthrough', 'recap']
    const keys = ['objective', 'purpose', 'format', 'prerequisites', 'visualApproach', 'maxDurationSeconds']
    if (
        Object.keys(value).some((k) => !keys.includes(k)) ||
        !purposes.includes(value.purpose) ||
        !formats.includes(value.format) ||
        !Number.isInteger(value.maxDurationSeconds) ||
        value.maxDurationSeconds < 60 ||
        value.maxDurationSeconds > 1800
    )
        return null
    const brief = {}
    for (const [key, max] of [
        ['objective', 240],
        ['prerequisites', 100],
        ['visualApproach', 120]
    ]) {
        const text = value[key]
        if (
            typeof text !== 'string' ||
            !text.trim() ||
            Array.from(text).length > max ||
            /[<>\u0000-\u001f\u007f]|https?:|www\.|\S+@\S+/.test(text)
        )
            return null
        brief[key] = text.replace(/\s+/g, ' ').trim()
    }
    brief.purpose = value.purpose
    brief.format = value.format
    brief.maxDurationSeconds = value.maxDurationSeconds
    if (Buffer.byteLength(JSON.stringify(brief), 'utf8') > 900) return null
    return brief
}

export const videoPlanningPolicy = `YouTube teaching-purpose planning v2:
Use a video only when motion, a demonstration, a narrated method or a focused explanation materially improves this learning objective. Imagine the useful teaching representation first; never imagine a real URL, transcript or timestamp.
Define a curriculum-only videoBrief with objective (one observable learning outcome, maximum 240 characters), purpose (concept_explanation, process_visualisation, worked_example, practical_demonstration, exam_technique or revision_recap), format (explanation, animation, demonstration, worked_example, exam_walkthrough or recap), prerequisites (maximum 100 characters), visualApproach (what the learner should notice, maximum 120 characters) and maxDurationSeconds (60 to 1800; prefer 180 to 480 for a focused explanation). Use plain text, no learner names, identity, chat excerpts, URLs, credentials or assessment answers. Use 'None beyond GCSE foundations' when no specific prerequisite is needed.
Choose the narrowest teaching purpose. An introduction to photosynthesis requires a concept explanation; a pondweed investigation requires a practical demonstration. A worked method and an exam-technique walkthrough have different purposes. Prefer a diagram/stepper/table if it communicates the point more precisely. Respect the current subject, mode, protected scope and Homework scaffolding; a video must not reveal the assigned answer.
All alternatives must serve this same objective and purpose. If exact-purpose evidence is absent or uncertain, use fewer videos or teach without a video. Metadata never proves watched content, factual accuracy, captions, a transcript or learner playback.`
