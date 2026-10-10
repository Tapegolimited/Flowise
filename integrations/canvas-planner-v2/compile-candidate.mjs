import {
    explicitStudentDocumentType,
    validateCandidatePlannerResult,
    CAPABILITY_REGISTRY,
    candidatePlanSchemaForRegistry
} from './candidate-planner.mjs'
import { effectiveCapabilityRegistry } from './visual-capability.mjs'
// Only declared, exact role aliases. No fuzzy classification or invented sections.
export const DECLARED_ROLE_ALIASES = { data_interpretation_lab: { enquiry_sequence: { read_encoding: 'read_the_encoding' } } }
export function schemaErrors(value, schema, path = '$') {
    const errors = []
    const kind = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v)
    if (schema.anyOf && !schema.anyOf.some((branch) => schemaErrors(value, branch, path).length === 0))
        return [path + ' does not match an allowed shape']
    const types = Array.isArray(schema.type) ? schema.type : [schema.type]
    if (
        schema.type &&
        !types.some((t) =>
            t === 'integer'
                ? Number.isSafeInteger(value)
                : t === 'number'
                ? typeof value === 'number' && Number.isFinite(value)
                : t === kind(value)
        )
    )
        return [path + ' invalid type']
    if (schema.const !== undefined && value !== schema.const) errors.push(path + ' invalid constant')
    if (schema.enum && !schema.enum.includes(value)) errors.push(path + ' invalid enum')
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const key of schema.required || []) if (!Object.hasOwn(value, key)) errors.push(path + '.' + key + ' missing')
        if (schema.additionalProperties === false)
            for (const key of Object.keys(value))
                if (!Object.hasOwn(schema.properties || {}, key)) errors.push(path + '.' + key + ' unsupported')
        for (const [key, child] of Object.entries(schema.properties || {}))
            if (Object.hasOwn(value, key)) errors.push(...schemaErrors(value[key], child, path + '.' + key))
    }
    if (Array.isArray(value)) {
        if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(path + ' too short')
        if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(path + ' too long')
        if (schema.items) value.forEach((item, index) => errors.push(...schemaErrors(item, schema.items, path + '[' + index + ']')))
    }
    if (typeof value === 'number') {
        if (schema.minimum !== undefined && value < schema.minimum) errors.push(path + ' below minimum')
        if (schema.maximum !== undefined && value > schema.maximum) errors.push(path + ' above maximum')
    }
    if (typeof value === 'string') {
        if (schema.minLength !== undefined && Array.from(value).length < schema.minLength) errors.push(path + ' too short')
        if (schema.maxLength !== undefined && Array.from(value).length > schema.maxLength) errors.push(path + ' too long')
    }
    return errors
}
export function compileCandidate(plan, { context, playbookCatalogue, formationCatalogue, registry = CAPABILITY_REGISTRY }) {
    const compiled = structuredClone(plan),
        changes = []
    if (!explicitStudentDocumentType(context) && compiled.choice?.requestedTypeStatus !== 'absent') {
        changes.push({
            field: 'choice.requestedTypeStatus',
            before: compiled.choice?.requestedTypeStatus,
            after: 'absent',
            reason: 'Trusted brief has no explicit student document type; request provenance is code-owned.'
        })
        compiled.choice.requestedTypeStatus = 'absent'
    }
    const formation = formationCatalogue.find((f) => f.playbookId === compiled.choice?.playbookId && f.id === compiled.choice?.formationId)
    const aliases = DECLARED_ROLE_ALIASES[compiled.choice?.playbookId]?.[compiled.choice?.formationId] || {}
    if (formation && Array.isArray(compiled.sections))
        compiled.sections.forEach((s, i) => {
            if (aliases[s.role] === formation.requiredSectionSequence[i]) {
                changes.push({
                    field: 'sections[' + i + '].role',
                    before: s.role,
                    after: aliases[s.role],
                    reason: 'Declared exact alias for this formation slot.'
                })
                s.role = aliases[s.role]
            }
        })
    registry = effectiveCapabilityRegistry(registry, context)
    const errors = schemaErrors(compiled, candidatePlanSchemaForRegistry(registry))
    const semantic = validateCandidatePlannerResult(compiled, { context, playbookCatalogue, formationCatalogue, registry })
    return {
        plan: compiled,
        changes,
        validation: { valid: !errors.length && semantic.valid, errors: [...errors, ...semantic.errors], warnings: semantic.warnings },
        policy: 'Identity, roles, resources and assessment remain guarded; no prose, evidence, block choice or student format is inferred by this compiler.'
    }
}
