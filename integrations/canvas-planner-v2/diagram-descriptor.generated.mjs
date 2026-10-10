// Generated from shared src/lib/toby-diagrams/descriptor.ts. Regenerate; do not edit.
// sourceSha256: bcdfa50a69e7d2a1a19ac6ba7ccb61c7fb1cbfd79e36dc96fe547dae6f361bd9
/** Versioned data only. Geometry, styling and educational labels are owned by code. */
export const DIAGRAM_VERSION = '1.0.0'
export const MAX_DIAGRAM_BYTES = 12_000
export const DIAGRAM_TEMPLATE_IDS = [
    'math.area.rectangle',
    'math.area.triangle',
    'math.area.trapezium',
    'physics.forces.single_object',
    'chemistry.particle.states',
    'biology.cell.animal',
    'biology.cell.plant'
]
export const CELL_STRUCTURES = {
    'biology.cell.animal': ['nucleus', 'cytoplasm', 'cell_membrane', 'mitochondria'],
    'biology.cell.plant': ['nucleus', 'cytoplasm', 'cell_membrane', 'mitochondria', 'cell_wall', 'chloroplasts', 'vacuole']
}
export const DIAGRAM_ALIASES = {
    'math.area.rectangle': { w: 'width', h: 'height', u: 'units', sh: 'shading' },
    'math.area.triangle': { b: 'base', h: 'height', u: 'units', sh: 'shading', hp: 'heightPosition' },
    'math.area.trapezium': { a: 'topBase', b: 'bottomBase', h: 'height', u: 'units', sh: 'shading' },
    'physics.forces.single_object': { obj: 'objectLabel', f: 'forces' },
    'chemistry.particle.states': { s: 'state', c: 'compareTo' },
    'biology.cell.animal': { l: 'labels', hl: 'highlights' },
    'biology.cell.plant': { l: 'labels', hl: 'highlights' }
}
function fail(why) {
    throw new Error(`diagram: ${why}`)
}
function record(input, path) {
    if (!input || typeof input !== 'object' || Array.isArray(input) || ![Object.prototype, null].includes(Object.getPrototypeOf(input)))
        fail(`${path} must be a plain object`)
    return input
}
function keys(input, allowed, path) {
    for (const key of Object.keys(input)) if (!allowed.includes(key)) fail(`${path}.${key} is not permitted`)
}
/** Check JSON structure before stringifying: toJSON, functions and cycles cannot run. */
function assertJson(input, ancestors = new Set(), depth = 0) {
    if (depth > 8) fail('descriptor nesting exceeds the limit')
    if (input === null || typeof input === 'string' || typeof input === 'boolean') return
    if (typeof input === 'number') {
        if (!Number.isFinite(input)) fail('numbers must be finite')
        return
    }
    if (!input || typeof input !== 'object') fail('descriptor must contain JSON data only')
    if (ancestors.has(input)) fail('descriptor cannot contain cycles')
    if (!Array.isArray(input)) record(input, 'descriptor')
    ancestors.add(input)
    for (const key of Object.keys(input)) {
        if (['__proto__', 'constructor', 'prototype'].includes(key)) fail('unsafe object key')
        const property = Object.getOwnPropertyDescriptor(input, key)
        if (!property || !('value' in property)) fail('descriptor accessors are not permitted')
        assertJson(property.value, ancestors, depth + 1)
    }
    ancestors.delete(input)
}
function numeric(value, path, max = 1_000) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0.1 || value > max) fail(`${path} must be between 0.1 and ${max}`)
    return value
}
function choice(value, allowed, path) {
    if (typeof value !== 'string' || !allowed.includes(value)) fail(`${path} is not supported`)
    return value
}
function plainText(value, max, path) {
    if (
        typeof value !== 'string' ||
        !value.trim() ||
        value.length > max ||
        value !== value.trim() ||
        Array.from(value).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127) ||
        /[<>]|(?:https?:|data:|javascript:|vbscript:|file:)|%[A-Z][A-Z0-9_]*%/i.test(value)
    )
        fail(`${path} must be plain text of 1-${max} characters`)
    return value
}
function parameters(id, value) {
    const p = record(value, 'parameters')
    if (id.startsWith('math.area.')) {
        const names =
            id === 'math.area.rectangle'
                ? ['width', 'height', 'units', 'shading']
                : id === 'math.area.triangle'
                ? ['base', 'height', 'units', 'shading', 'heightPosition']
                : ['topBase', 'bottomBase', 'height', 'units', 'shading']
        keys(p, names, 'parameters')
        const units = choice(p.units, ['mm', 'cm', 'm'], 'units')
        const height = numeric(p.height, 'height')
        const styling = {}
        if (p.shading !== undefined) styling.shading = choice(p.shading, ['region', 'none'], 'shading')
        if (id === 'math.area.rectangle') return { width: numeric(p.width, 'width'), height, units, ...styling }
        if (id === 'math.area.triangle') {
            if (p.heightPosition !== undefined) styling.heightPosition = choice(p.heightPosition, ['inside', 'outside'], 'heightPosition')
            return { base: numeric(p.base, 'base'), height, units, ...styling }
        }
        const topBase = numeric(p.topBase, 'topBase'),
            bottomBase = numeric(p.bottomBase, 'bottomBase')
        if (topBase === bottomBase) fail('trapezium bases must differ; use the rectangle template for a rectangular region')
        return { topBase, bottomBase, height, units, ...styling }
    }
    if (id === 'physics.forces.single_object') {
        keys(p, ['objectLabel', 'forces'], 'parameters')
        const objectLabel = plainText(p.objectLabel, 48, 'objectLabel')
        if (!Array.isArray(p.forces) || p.forces.length < 1 || p.forces.length > 4) fail('forces requires 1-4 arrows')
        const directions = new Set()
        const forces = p.forces.map((input, index) => {
            const f = record(input, `forces[${index}]`)
            keys(f, ['direction', 'label', 'magnitude', 'unit'], `forces[${index}]`)
            const direction = choice(f.direction, ['up', 'down', 'left', 'right'], 'direction')
            if (directions.has(direction)) fail('force directions must be unique in this template')
            directions.add(direction)
            const arrow = { direction, label: plainText(f.label, 32, 'force label') }
            if (f.magnitude !== undefined) {
                arrow.magnitude = numeric(f.magnitude, 'magnitude', 10_000)
                arrow.unit = choice(f.unit, ['N'], 'unit')
            } else if (f.unit !== undefined) fail('force unit requires a magnitude')
            return arrow
        })
        return { objectLabel, forces }
    }
    if (id === 'chemistry.particle.states') {
        keys(p, ['state', 'compareTo'], 'parameters')
        const state = choice(p.state, ['solid', 'liquid', 'gas'], 'state')
        if (p.compareTo === undefined) return { state }
        const compareTo = choice(p.compareTo, ['solid', 'liquid', 'gas'], 'compareTo')
        if (compareTo === state) fail('comparison requires two different particle states')
        return { state, compareTo }
    }
    keys(p, ['labels', 'highlights'], 'parameters')
    const result = {}
    if (p.labels !== undefined) {
        if (typeof p.labels !== 'boolean') fail('labels must be boolean')
        result.labels = p.labels
    }
    if (p.highlights !== undefined) {
        if (!Array.isArray(p.highlights) || p.highlights.length > 3) fail('highlights accepts at most 3 structures')
        const allowed = CELL_STRUCTURES[id]
        result.highlights = p.highlights.map((value) => choice(value, allowed, 'highlight'))
        if (new Set(result.highlights).size !== result.highlights.length) fail('highlights must be unique')
    }
    return result
}
function expandAliases(id, value) {
    const compact = record(value, 'p')
    const aliases = DIAGRAM_ALIASES[id]
    keys(compact, Object.keys(aliases), 'p')
    const expanded = {}
    for (const [key, value] of Object.entries(compact)) expanded[aliases[key]] = value
    if (id === 'physics.forces.single_object' && Array.isArray(expanded.forces)) {
        expanded.forces = expanded.forces.map((input) => {
            const f = record(input, 'force'),
                arrow = {}
            const map = { d: 'direction', l: 'label', m: 'magnitude', u: 'unit' }
            keys(f, Object.keys(map), 'force')
            for (const [key, value] of Object.entries(f)) arrow[map[key]] = value
            return arrow
        })
    }
    return expanded
}
export function parseDiagramDescriptor(input) {
    assertJson(input)
    const source = JSON.stringify(input)
    if (new TextEncoder().encode(source).byteLength > MAX_DIAGRAM_BYTES) fail('descriptor exceeds 12000 UTF-8 bytes')
    const value = record(input, 'descriptor')
    const compact = Object.hasOwn(value, 'v')
    keys(
        value,
        compact ? ['v', 't', 'p', 'view'] : ['schemaVersion', 'templateId', 'templateVersion', 'parameters', 'variant'],
        'descriptor'
    )
    if ((compact ? value.v : value.schemaVersion) !== 1) fail('schema version must be 1')
    let id, version
    if (compact) {
        if (typeof value.t !== 'string') fail('t requires a versioned template identifier')
        const parts = value.t.split('@')
        if (parts.length !== 2) fail('t requires template@version')
        id = choice(parts[0], DIAGRAM_TEMPLATE_IDS, 'templateId')
        version = parts[1]
    } else {
        id = choice(value.templateId, DIAGRAM_TEMPLATE_IDS, 'templateId')
        version = value.templateVersion
    }
    if (version !== DIAGRAM_VERSION) fail('template version is not supported')
    const variant = choice(
        compact ? (value.view === undefined ? 'hint' : value.view) : value.variant,
        ['labelled', 'hint', 'blank'],
        'variant'
    )
    const resolved = parameters(id, compact ? expandAliases(id, value.p) : value.parameters)
    return { schemaVersion: 1, templateId: id, templateVersion: DIAGRAM_VERSION, parameters: resolved, variant }
}
/** Server policy is authoritative; this guard protects consumers supplied trusted context. */
export function applyDiagramPolicy(input, policy) {
    const mode = policy?.mode?.toLowerCase().replaceAll('_', '-') ?? ''
    const state = policy?.assessmentState?.toLowerCase().replaceAll('_', '-') ?? ''
    if (['active', 'in-progress', 'started', 'independent'].includes(state))
        fail('visual coaching is unavailable during an active assessment')
    if (mode.includes('paper') && !['submitted', 'completed', 'marked', 'review', 'post-submission'].includes(state))
        fail('paper visuals require a verified post-submission state')
    return mode.includes('homework') && input.variant === 'labelled' ? { ...input, variant: 'hint' } : input
}
