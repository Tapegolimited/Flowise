/** Guarded deployment of the reviewed visual extension; no prediction endpoint. */
import { readFile, writeFile, mkdir, chmod, realpath } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, dirname, isAbsolute, relative, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import { extendCurrentBuilder, extendCurrentParent, extendCurrentQueueTool } from './diagram-candidate-extension.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const repository = resolve(here, '../..')
export const hash = (value) => createHash('sha256').update(value).digest('hex')
const stable = (value) =>
    Array.isArray(value)
        ? value.map(stable)
        : value && typeof value === 'object'
        ? Object.fromEntries(
              Object.keys(value)
                  .sort()
                  .map((key) => [key, stable(value[key])])
          )
        : value
export function metadataHash(definition, field, extraFields = []) {
    return hash(
        JSON.stringify(
            stable(Object.fromEntries(Object.entries(definition).filter(([key]) => ![field, ...extraFields, 'updatedDate'].includes(key))))
        )
    )
}
export function operation(kind, before, candidate) {
    const field = kind === 'tool' ? 'func' : 'flowData'
    let after
    if (kind === 'tool') after = candidate.patch.value
    else if (kind === 'builder') after = JSON.stringify(candidate.graph)
    else {
        if (hash(before.flowData) !== candidate.sourceFlowSha256) throw Error('Parent source changed')
        const graph = JSON.parse(before.flowData)
        for (const patch of candidate.patches) {
            const inputs = graph.nodes.find((node) => node.id === patch.nodeId)?.data?.inputs
            if (!inputs || hash(inputs[patch.input]) !== patch.expectedBeforeSha256) throw Error('Parent input changed')
            inputs[patch.input] = patch.value
        }
        after = JSON.stringify(graph)
    }
    if (typeof before[field] !== 'string' || typeof after !== 'string' || before[field] === after) throw Error('Invalid release operation')
    let apiConfig
    if (kind === 'parent') {
        if (
            typeof before.apiConfig !== 'string' ||
            typeof candidate.apiConfig !== 'string' ||
            hash(before.apiConfig) !== candidate.sourceApiConfigSha256
        )
            throw Error('Parent API config changed')
        apiConfig = {
            before: before.apiConfig,
            after: candidate.apiConfig,
            beforeSha256: hash(before.apiConfig),
            afterSha256: hash(candidate.apiConfig)
        }
    }
    return {
        kind,
        id: before.id,
        field,
        name: before.name,
        before: before[field],
        after,
        beforeSha256: hash(before[field]),
        afterSha256: hash(after),
        metadataSha256: metadataHash(before, field, apiConfig ? ['apiConfig'] : []),
        ...(apiConfig ? { apiConfig } : {})
    }
}
export function stateOf(current, op) {
    if (current.id !== op.id || metadataHash(current, op.field, op.apiConfig ? ['apiConfig'] : []) !== op.metadataSha256)
        throw Error('Unrelated resource drift: ' + op.id)
    const value = hash(current[op.field])
    if (value === op.beforeSha256 && (!op.apiConfig || hash(current.apiConfig) === op.apiConfig.beforeSha256)) return 'before'
    if (value === op.afterSha256 && (!op.apiConfig || hash(current.apiConfig) === op.apiConfig.afterSha256)) return 'after'
    throw Error('Concurrent source change: ' + op.id)
}
export async function runOperations(api, operations, { rollback = false, verifyOnly = false, record = async () => {} } = {}) {
    const resources = new Set()
    for (const op of operations) {
        const field = op.kind === 'tool' ? 'func' : ['builder', 'parent'].includes(op.kind) ? 'flowData' : null
        const resource = (op.kind === 'tool' ? 'tools/' : 'chatflows/') + op.id
        if (
            !field ||
            op.field !== field ||
            typeof op.id !== 'string' ||
            !/^[A-Za-z0-9-]+$/.test(op.id) ||
            resources.has(resource) ||
            typeof op.before !== 'string' ||
            typeof op.after !== 'string' ||
            hash(op.before) !== op.beforeSha256 ||
            hash(op.after) !== op.afterSha256 ||
            !/^[a-f0-9]{64}$/.test(op.metadataSha256)
        )
            throw Error('Invalid release manifest operation')
        if ((op.kind === 'parent') !== Object.hasOwn(op, 'apiConfig')) throw Error('Invalid parent API configuration operation')
        if (
            op.apiConfig &&
            (typeof op.apiConfig.before !== 'string' ||
                typeof op.apiConfig.after !== 'string' ||
                hash(op.apiConfig.before) !== op.apiConfig.beforeSha256 ||
                hash(op.apiConfig.after) !== op.apiConfig.afterSha256)
        )
            throw Error('Invalid parent API configuration payload')
        resources.add(resource)
    }
    const ordered = rollback ? [...operations].reverse() : operations
    const resource = (op) => (op.kind === 'tool' ? 'tools/' : 'chatflows/') + op.id
    const desired = rollback ? 'before' : 'after'
    // Preflight the complete release before the first mutation.
    for (const op of ordered) stateOf(await api('GET', resource(op)), op)
    const results = []
    for (const op of ordered) {
        const state = stateOf(await api('GET', resource(op)), op)
        if (state !== desired) {
            if (verifyOnly) throw Error('Resource is not at requested release: ' + op.id)
            await api('PUT', resource(op), { [op.field]: op[desired], ...(op.apiConfig ? { apiConfig: op.apiConfig[desired] } : {}) })
            if (stateOf(await api('GET', resource(op)), op) !== desired) throw Error('Readback failed: ' + op.id)
        }
        results.push({
            kind: op.kind,
            id: op.id,
            sha256: op[desired + 'Sha256'],
            ...(op.apiConfig ? { apiConfigSha256: op.apiConfig[desired + 'Sha256'] } : {}),
            changed: state !== desired
        })
        await record(results)
    }
    return results
}
async function apiClient(writes) {
    const env = process.env
    if (!env.FLOWISE_BASE_URL || !env.FLOWISE_API_KEY) throw Error('Flowise environment unavailable')
    const base = new URL(env.FLOWISE_BASE_URL)
    if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || base.pathname !== '/')
        throw Error('FLOWISE_BASE_URL must be an HTTPS origin without credentials')
    return async (method, path, body) => {
        if (!/^(chatflows|tools)\/[0-9a-f-]{36}$/.test(path) || !['GET', 'PUT'].includes(method) || (method === 'PUT' && !writes))
            throw Error('Operation outside release scope')
        const response = await fetch(base.origin + '/api/v1/' + path, {
            method,
            headers: { Authorization: 'Bearer ' + env.FLOWISE_API_KEY, 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(30_000)
        })
        if (!response.ok) throw Error(`Flowise ${method} ${path}: HTTP ${response.status}`)
        return response.json()
    }
}
async function boundedMap(items, callback) {
    const results = []
    let index = 0
    await Promise.all(
        Array.from({ length: Math.min(4, items.length) }, async () => {
            while (index < items.length) {
                const i = index++
                results[i] = await callback(items[i])
            }
        })
    )
    return results
}
async function privateJson(path, value) {
    await writeFile(path, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 })
    await chmod(path, 0o600)
}
export function releaseInventory(receipt) {
    const groups = { builder: [], tool: [], parent: [] },
        ids = new Set()
    for (const row of receipt?.results || []) {
        if (
            !Object.hasOwn(groups, row.kind) ||
            typeof row.id !== 'string' ||
            !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(row.id) ||
            ids.has(row.id)
        )
            throw Error('Invalid reviewed release inventory')
        ids.add(row.id)
        groups[row.kind].push(row.id)
    }
    if (groups.builder.length !== 4 || groups.tool.length !== 18 || groups.parent.length !== 18) throw Error('Unexpected release inventory')
    return groups
}
export async function releaseDestination(releaseDir, outputRoot = process.env.TOBY_RELEASE_OUTPUT_ROOT) {
    if (!outputRoot || !isAbsolute(outputRoot) || !isAbsolute(releaseDir))
        throw Error('Absolute private output root and release directory required')
    const root = await realpath(outputRoot),
        checkout = await realpath(repository)
    const inCheckout = (path) => {
        const rel = relative(checkout, path)
        return rel === '' || (!rel.startsWith('..' + sep) && rel !== '..' && !isAbsolute(rel))
    }
    if (inCheckout(root)) throw Error('Private backups must remain outside the Git checkout')
    const destination = resolve(releaseDir)
    if ((await realpath(dirname(destination))) !== root || dirname(destination) !== root)
        throw Error('Release must be a direct child of the real private output root')
    try {
        if ((await realpath(destination)) !== destination) throw Error('Release directory cannot be a symbolic link')
    } catch (error) {
        if (error.code !== 'ENOENT') throw error
    }
    return destination
}
async function main() {
    const [mode, releaseDir] = process.argv.slice(2)
    if (!['prepare', 'apply', 'verify', 'rollback'].includes(mode) || !releaseDir)
        throw Error('Usage: flowise-release.mjs prepare|apply|verify|rollback OUTPUT_DIRECTORY')
    const destination = await releaseDestination(releaseDir)
    const api = await apiClient(mode === 'apply' || mode === 'rollback')
    const manifestPath = resolve(destination, 'private-release.json')
    if (mode === 'prepare') {
        await mkdir(destination, { recursive: false, mode: 0o700 })
        const inventory = releaseInventory(JSON.parse(await readFile(resolve(here, 'release-receipt-2026-10-10.json'), 'utf8')))
        const builders = await boundedMap(inventory.builder, (id) => api('GET', 'chatflows/' + id))
        const tools = await boundedMap(inventory.tool, (id) => api('GET', 'tools/' + id))
        const parents = await boundedMap(inventory.parent, (id) => api('GET', 'chatflows/' + id))
        await privateJson(resolve(destination, 'original-definitions.json'), { builders, tools, parents })
        const operations = [
            ...builders.map((row) => operation('builder', row, extendCurrentBuilder(row))),
            ...tools.map((row) => operation('tool', row, extendCurrentQueueTool(row))),
            ...parents.map((row) => operation('parent', row, extendCurrentParent(row, tools)))
        ]
        for (const op of operations.filter((op) => op.field === 'flowData')) {
            JSON.parse(op.after)
            const result = spawnSync(process.execPath, [resolve(here, 'quality/check-prompt-braces.cjs'), '/dev/stdin'], {
                input: op.after,
                encoding: 'utf8'
            })
            if (result.status) throw Error('Prompt brace validation failed for ' + op.id + ': ' + result.stdout.slice(0, 1200))
        }
        const manifest = { preparedAt: new Date().toISOString(), operations }
        await privateJson(manifestPath, manifest)
        const receipt = {
            preparedAt: manifest.preparedAt,
            writes: false,
            operations: operations.map(({ kind, id, name, beforeSha256, afterSha256, metadataSha256, apiConfig }) => ({
                kind,
                id,
                name,
                beforeSha256,
                afterSha256,
                metadataSha256,
                ...(apiConfig ? { apiConfigBeforeSha256: apiConfig.beforeSha256, apiConfigAfterSha256: apiConfig.afterSha256 } : {})
            }))
        }
        await privateJson(resolve(destination, 'preparation-receipt.json'), receipt)
        console.log(
            JSON.stringify({
                prepared: true,
                builders: builders.length,
                tools: tools.length,
                parents: parents.length,
                directory: destination
            })
        )
        return
    }
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    if (manifest.operations.length !== 40) throw Error('Release operation count changed')
    const receiptPath = resolve(destination, mode + '-receipt.json')
    const results = await runOperations(api, manifest.operations, {
        rollback: mode === 'rollback',
        verifyOnly: mode === 'verify',
        record: (results) => privateJson(receiptPath, { mode, checkedAt: new Date().toISOString(), complete: false, results })
    })
    await privateJson(receiptPath, { mode, checkedAt: new Date().toISOString(), complete: true, results })
    console.log(JSON.stringify({ mode, complete: true, checked: results.length, changed: results.filter((row) => row.changed).length }))
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
