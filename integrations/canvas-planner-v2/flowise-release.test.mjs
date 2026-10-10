import test from 'node:test'
import assert from 'node:assert/strict'
import { hash, metadataHash, operation, stateOf, runOperations, releaseInventory, releaseDestination } from './flowise-release.mjs'
import { readFile, mkdtemp, mkdir, symlink, rm, realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
const fixture = () => {
    const original = {
        id: 'test-tool',
        name: 'queue_canvas_build_v2_test',
        func: 'before',
        updatedDate: 'old',
        schema: '{}',
        color: '#123456'
    }
    return { original, op: operation('tool', original, { patch: { value: 'after' } }) }
}
test('metadata and source drift both reject without modifying originals', () => {
    const { original, op } = fixture()
    assert.equal(stateOf(original, op), 'before')
    assert.equal(stateOf({ ...original, func: 'after', updatedDate: 'new' }, op), 'after')
    assert.throws(() => stateOf({ ...original, func: 'someone else' }, op), /Concurrent/)
    assert.throws(() => stateOf({ ...original, schema: '{"new":true}' }, op), /Unrelated/)
    assert.equal(original.func, 'before')
})
test('apply, idempotent readback and reverse only mutate the selected field', async () => {
    const { original, op } = fixture()
    let current = { ...original }
    const writes = []
    const api = async (method, path, body) => {
        assert.equal(path, 'tools/test-tool')
        if (method === 'PUT') {
            writes.push(body)
            current = { ...current, ...body, updatedDate: 'new' }
        }
        return { ...current }
    }
    await runOperations(api, [op])
    await runOperations(api, [op])
    await runOperations(api, [op], { verifyOnly: true })
    assert.deepEqual(writes, [{ func: 'after' }])
    await runOperations(api, [op], { rollback: true })
    assert.deepEqual(writes, [{ func: 'after' }, { func: 'before' }])
    assert.equal(current.schema, original.schema)
})
test('preflight rejects another resource drift before any writes', async () => {
    const { original, op } = fixture()
    const second = { ...op, id: 'second' }
    let writes = 0
    await assert.rejects(
        runOperations(
            async (method, path) => {
                if (method === 'PUT') writes++
                return path.endsWith('second') ? { ...original, id: 'second', func: 'changed' } : original
            },
            [op, second]
        ),
        /Unrelated|Concurrent/
    )
    assert.equal(writes, 0)
})
test('concurrent drift after preflight blocks the specific write', async () => {
    const { original, op } = fixture()
    let reads = 0,
        writes = 0
    await assert.rejects(
        runOperations(
            async (method) => {
                if (method === 'PUT') writes++
                return ++reads === 1 ? original : { ...original, func: 'changed' }
            },
            [op]
        ),
        /Concurrent/
    )
    assert.equal(writes, 0)
})
test('unexpected write readback stops before the next operation', async () => {
    const { original, op } = fixture()
    let written = false
    await assert.rejects(
        runOperations(
            async (method) => {
                if (method === 'PUT') written = true
                return written ? { ...original, func: 'after', schema: 'changed unexpectedly' } : original
            },
            [op]
        ),
        /Unrelated/
    )
})
test('verify never repairs drift by writing', async () => {
    const { original, op } = fixture()
    let writes = 0
    await assert.rejects(
        runOperations(
            async (method) => {
                if (method === 'PUT') writes++
                return original
            },
            [op],
            { verifyOnly: true }
        ),
        /not at requested/
    )
    assert.equal(writes, 0)
})
test('tampered payloads, wrong fields and duplicate resources reject before any API call', async () => {
    const { op } = fixture()
    for (const operations of [
        [{ ...op, after: 'unreviewed' }],
        [{ ...op, before: 'unreviewed' }],
        [{ ...op, field: 'schema' }],
        [op, op]
    ]) {
        let calls = 0
        await assert.rejects(
            runOperations(async () => {
                calls++
            }, operations),
            /Invalid release manifest/
        )
        assert.equal(calls, 0)
    }
})
test('parent prompt and required runtime allowlist apply and restore atomically', async () => {
    const before = { id: 'parent-test', flowData: 'graph-before', apiConfig: 'config-before', name: 'parent', updatedDate: 'old' }
    const op = {
        kind: 'parent',
        id: before.id,
        field: 'flowData',
        before: before.flowData,
        after: 'graph-after',
        beforeSha256: hash(before.flowData),
        afterSha256: hash('graph-after'),
        metadataSha256: metadataHash(before, 'flowData', ['apiConfig']),
        apiConfig: {
            before: before.apiConfig,
            after: 'config-after',
            beforeSha256: hash(before.apiConfig),
            afterSha256: hash('config-after')
        }
    }
    let current = { ...before }
    const writes = []
    const api = async (method, path, body) => {
        if (method === 'PUT') {
            writes.push(body)
            current = { ...current, ...body }
        }
        return { ...current }
    }
    await runOperations(api, [op])
    assert.deepEqual(writes, [{ flowData: 'graph-after', apiConfig: 'config-after' }])
    assert.throws(() => stateOf({ ...current, apiConfig: 'config-before' }, op), /Concurrent/)
    let calls = 0
    await assert.rejects(
        runOperations(async () => {
            calls++
        }, [{ ...op, apiConfig: { ...op.apiConfig, after: 'tampered' } }]),
        /Invalid parent/
    )
    assert.equal(calls, 0)
    await runOperations(api, [op], { rollback: true })
    assert.deepEqual(current, before)
})
test('public receipt provides only the fixed reviewed resource inventory', async () => {
    const receipt = JSON.parse(await readFile(new URL('./release-receipt-2026-10-10.json', import.meta.url), 'utf8'))
    const inventory = releaseInventory(receipt)
    assert.deepEqual(
        Object.values(inventory).map((ids) => ids.length),
        [4, 18, 18]
    )
    assert.throws(() => releaseInventory({ ...receipt, results: [...receipt.results, receipt.results[0]] }), /Invalid/)
    assert.throws(() => releaseInventory({ ...receipt, results: receipt.results.slice(1) }), /Unexpected/)
    assert.throws(() => releaseInventory({ results: [{ kind: 'prediction', id: receipt.results[0].id }] }), /Invalid/)
})
test('private release files require a real direct child outside the checkout', async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'toby-config-release-')))
    try {
        const destination = join(root, 'reviewed-release')
        assert.equal(await releaseDestination(destination, root), destination)
        await assert.rejects(releaseDestination(join(root, 'nested', 'release'), root))
        await assert.rejects(releaseDestination(destination, '.'), /Absolute/)
        await assert.rejects(releaseDestination('release', root), /Absolute/)
        const checkout = fileURLToPath(new URL('../../', import.meta.url)).replace(/\/$/, '')
        await assert.rejects(releaseDestination(join(checkout, 'private'), checkout), /outside/)
        await mkdir(join(root, 'actual'))
        await symlink(join(root, 'actual'), destination)
        await assert.rejects(releaseDestination(destination, root), /symbolic/)
    } finally {
        await rm(root, { recursive: true, force: true })
    }
})
