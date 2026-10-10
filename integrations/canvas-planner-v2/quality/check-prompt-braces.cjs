#!/usr/bin/env node

const fs = require('fs')

const file = process.argv[2]
if (!file) {
    console.error('Usage: check_prompt_braces.js <flowise-export.json>')
    process.exit(2)
}

const flow = JSON.parse(fs.readFileSync(file, 'utf8'))
const promptKeys = new Set(['systemMessage', 'chatPromptTemplate', 'prompt', 'template', 'agentSystemMessage'])

const failures = []

function visit(value, path = []) {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) {
        value.forEach((item, index) => visit(item, path.concat(index)))
        return
    }

    for (const [key, child] of Object.entries(value)) {
        const childPath = path.concat(key)
        if (key === 'flowData' && typeof child === 'string') {
            try {
                visit(JSON.parse(child), childPath)
            } catch (error) {
                failures.push({
                    path: childPath.join('.'),
                    singles: [{ index: -1, brace: '', context: `Invalid flowData JSON: ${error.message}` }]
                })
            }
            continue
        }
        if (typeof child === 'string' && promptKeys.has(key)) {
            const singles = findSingleBraces(child)
            if (singles.length) failures.push({ path: childPath.join('.'), singles })
        } else {
            visit(child, childPath)
        }
    }
}

function findSingleBraces(text) {
    const singles = []
    for (let i = 0; i < text.length; i += 1) {
        const ch = text[i]
        if (ch !== '{' && ch !== '}') continue
        if (text[i + 1] === ch) {
            i += 1
            continue
        }
        singles.push({
            index: i,
            brace: ch,
            context: text.slice(Math.max(0, i - 35), i + 55).replace(/\n/g, '\\n')
        })
    }
    return singles
}

visit(flow)

if (failures.length) {
    console.error(JSON.stringify({ ok: false, failures }, null, 2))
    process.exit(1)
}

console.log(JSON.stringify({ ok: true, checked: file }, null, 2))
