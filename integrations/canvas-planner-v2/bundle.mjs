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
                    .replace(/^import\s[\s\S]*?\sfrom\s+(['"])[^'"\r\n]+\1;?[ \t]*(?:\r?\n|$)/gm, '')
                    .replace(/^export /gm, '')
                if (name === 'candidate-planner.mjs')
                    source = source.replace(
                        /^const CAPABILITY_REGISTRY\s*=\s*JSON\.parse\(\s*readFileSync\(\s*new URL\(\s*['"]\.\/capability-registry\.json['"]\s*,\s*import\.meta\.url\s*\)\s*,\s*['"]utf8['"]\s*\)\s*\);?[ \t]*(?:\r?\n|$)/m,
                        ''
                    )
                return source.replace(/structuredClone\(plan\)/g, 'JSON.parse(JSON.stringify(plan))')
            })
            .join('\n')
    )
}
