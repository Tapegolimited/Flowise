const visualLanguages = ['toby-diagram', 'mermaid', 'vega', 'vega-lite', 'jsxgraph', 'smiles', 'ketcher', 'latex']

/** Only the speech input is projected. Assistant text, history and model memory retain their original source. */
export function safeVisualSpeechText(text: string): string {
    const lines = text.match(/[^\n]*\n|[^\n]+$/g) ?? []
    const output: string[] = []
    for (let index = 0; index < lines.length; index++) {
        const opening = /^ {0,3}(`{3,}|~{3,})([^\r\n]*)\r?\n?$/.exec(lines[index])
        if (!opening) {
            output.push(lines[index])
            continue
        }
        const info = opening[2].trim().toLowerCase()
        const visual = visualLanguages.some(
            (language) =>
                info === language || info.startsWith(language + ' ') || info.startsWith(language + '\t') || info.startsWith(language + '{')
        )
        const close = new RegExp('^ {0,3}' + opening[1][0] + '{' + opening[1].length + ',}[ \\t]*(?:\\r?\\n)?$')
        let end = index + 1
        while (end < lines.length && !close.test(lines[end])) end++
        // Treat unknown/ordinary fences as one opaque example, preserving embedded fence-like text.
        if (visual) output.push('Visual.\n')
        else output.push(lines.slice(index, Math.min(end + 1, lines.length)).join(''))
        index = end
    }
    return output.join('')
}
