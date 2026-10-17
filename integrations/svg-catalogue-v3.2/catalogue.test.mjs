import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { lookupCatalogue, authoringCatalogue, patchCode, patchLookup } from './upgrade.mjs'
test('all 373 retrieval schemas have corresponding deterministic readers', () => {
    const context = vm.createContext({ TextEncoder })
    vm.runInContext(readFileSync(new URL('./reader.generated.js', import.meta.url), 'utf8'), context)
    const ids = vm.runInContext('TobyCurriculumReader.DIAGRAM_TEMPLATE_IDS', context)
    assert.equal(ids.length, 373)
    assert.equal(new Set(ids).size, 373)
    assert.deepEqual([...ids].sort(), lookupCatalogue.templates.map((t) => t.templateId).sort())
    assert.deepEqual(authoringCatalogue.templates.map((t) => t.templateId).sort(), [...ids].sort())
    for (const s of lookupCatalogue.templates.filter((t) => t.variantSemantics === 'preserve-givens')) {
        for (const view of ['labelled', 'hint', 'blank']) {
            context.input = JSON.stringify({ ...s.example, view })
            const d = vm.runInContext('TobyCurriculumReader.parseDiagramDescriptor(JSON.parse(input))', context)
            assert.equal(JSON.stringify(d.parameters), JSON.stringify(s.example.p))
        }
        assert(s.subtopicIds.every((x) => Number.isSafeInteger(x) && x > 0))
        assert(!s.subjectIds?.includes('subj-combined-sci'))
    }
})
test('migration refuses unknown reader and lookup boundaries', () => {
    assert.throws(() => patchCode('var TobyCurriculumReader = unknown;'))
    assert.throws(() => patchLookup('const catalogue={};'))
    assert.equal(patchCode('return 42;').code, 'return 42;')
})
