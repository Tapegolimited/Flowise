import { readFileSync } from 'node:fs'
export function bundleModules(names, constants = {}) {
    return (
        Object.entries(constants)
            .map(([name, value]) => 'const ' + name + '=' + JSON.stringify(value) + ';')
            .join('\n') +
        '\n' +
        names
            .map((name) => {
                let source = readFileSync(new URL(name, import.meta.url), 'utf8')
                    .replace(/^import .*;\n/gm, '')
                    .replace(/^export /gm, '')
                if (name === 'candidate-planner.mjs')
                    source = source.replace(
                        /const CAPABILITY_REGISTRY = JSON\.parse\(readFileSync\(new URL\('\.\/capability-registry\.json', import\.meta\.url\), 'utf8'\)\);/,
                        ''
                    )
                return source.replace(/structuredClone\(plan\)/g, 'JSON.parse(JSON.stringify(plan))')
            })
            .join('\n')
    )
}
