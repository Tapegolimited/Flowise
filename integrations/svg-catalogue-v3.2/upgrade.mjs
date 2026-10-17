/** Additive data/reader migration. Preserves graph edges, runtime identities and failure wrappers. */
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import vm from 'node:vm'
export const hash = (s) => createHash('sha256').update(s).digest('hex')
const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8')
export const lookupCatalogue = JSON.parse(read('./lookup-catalogue.json')),
    authoringCatalogue = JSON.parse(read('./authoring-catalogue.json'))
const reader = read('./reader.generated.js') + '\n',
    pins = new Set([
        '75334e0be8916e955814951bfd97fde978d360fa1bd31817b991e0a574678274',
        'ec6b15acb5ec84313632f0e0a4784ae0829fdea7f8535e3fc5f630a62bf6148c'
    ])
export function patchCode(before) {
    let code = before,
        changes = []
    if (code.includes('var TobyCurriculumReader')) {
        const start = code.indexOf('var TobyCurriculumReader'),
            end = code.indexOf('const { parseDiagramDescriptor, DIAGRAM_TEMPLATE_IDS } = TobyCurriculumReader', start)
        if (end < 0 || !pins.has(hash(code.slice(start, end)))) throw Error('reader_source_drift')
        code = code.slice(0, start) + reader + code.slice(end)
        changes.push('reader')
    }
    const registry = /const CAPABILITY_REGISTRY=(\{[^\n]*\});/g
    code = code.replace(registry, (full, raw) => {
        const r = JSON.parse(raw),
            d = r.capabilities.filter((x) => x.id === 'template_diagram')
        if (d.length !== 1 || d[0].families.length !== 335) throw Error('registry_source_drift')
        const old = lookupCatalogue.templates.slice(0, 335).map((t) => t.templateId)
        if (d[0].families.some((id) => !old.includes(id))) throw Error('registry_identity_drift')
        d[0].families = lookupCatalogue.templates.map((t) => t.templateId)
        changes.push('families')
        return 'const CAPABILITY_REGISTRY=' + JSON.stringify(r) + ';'
    })
    code = code.replace(/const TOBY_CURRICULUM_CATALOGUE=(\{[^\n]*\});/g, (full, raw) => {
        const c = JSON.parse(raw)
        if (c.catalogueVersion !== '3.0.0' || JSON.stringify(c.templates) !== JSON.stringify(authoringCatalogue.templates.slice(0, 335)))
            throw Error('authoring_catalogue_drift')
        changes.push('authoring')
        return 'const TOBY_CURRICULUM_CATALOGUE=' + JSON.stringify(authoringCatalogue) + ';'
    })
    if (changes.includes('authoring')) {
        const old =
            'New curriculum hint/blank variants reset geometry and supplied text to neutral recall examples and withhold labels; preserve original assessment stimuli through their existing owner.'
        if (!code.includes(old)) throw Error('variant_instruction_drift')
        code = code
            .replace('CURRICULUM TEMPLATE CATALOGUE 3.0.0.', 'CURRICULUM TEMPLATE CATALOGUE 3.2.0.')
            .replace(
                old,
                'Follow each contract variant semantics. Fixed-givens templates preserve supplied geometry and measurements in hint/blank while withholding semantic names and completion annotations. Earlier curriculum templates retain neutral recall schematics. Preserve authentic assessment stimuli through their existing owner.'
            )
    }
    if (changes.length) new vm.Script('(async function(){' + code + '})')
    return { code, changes }
}
export function patchLookup(source) {
    const marker = ';\nfunction lookupTemplate(',
        at = source.indexOf(marker)
    if (!source.startsWith('const catalogue=') || at < 0) throw Error('lookup_boundary')
    const old = JSON.parse(source.slice(16, at))
    if (old.catalogueVersion !== '3.0.0' || JSON.stringify(old.templates) !== JSON.stringify(lookupCatalogue.templates.slice(0, 335)))
        throw Error('lookup_catalogue_drift')
    let tail = source.slice(at)
    if (!tail.includes("catalogueVersion: '3.0.0'")) throw Error('lookup_version_drift')
    tail = tail
        .replace("catalogueVersion: '3.0.0'", 'catalogueVersion: catalogue.catalogueVersion')
        .replace(
            "'New hint/blank variants are neutral recall schematics. Preserve authentic stimuli through their existing owner.'",
            "spec.variantSemantics === 'preserve-givens' ? 'Hint/blank preserves supplied geometry and measurements while withholding semantic labels and completion annotations.' : 'Hint/blank variants are neutral recall schematics. Preserve authentic stimuli through their existing owner.'"
        )
    const code = 'const catalogue=' + JSON.stringify(lookupCatalogue) + tail
    new vm.Script('(async function(){' + code + '})')
    return code
}
export function patchFlow(flow) {
    const graph = JSON.parse(flow.flowData),
        patches = []
    for (const n of graph.nodes)
        for (const key of ['code', 'customToolFunc']) {
            const c = n.data?.inputs?.[key]
            if (typeof c !== 'string') continue
            const result = patchCode(c)
            if (!result.changes.length) continue
            n.data.inputs[key] = result.code
            if (key === 'code') {
                if (n.data.inputs.customFunctionJavascriptFunction !== c) throw Error('code_alias_drift')
                n.data.inputs.customFunctionJavascriptFunction = result.code
            }
            patches.push({ node: n.id, input: key, changes: result.changes, beforeSha256: hash(c), afterSha256: hash(result.code) })
        }
    return { flowData: JSON.stringify(graph), patches }
}
