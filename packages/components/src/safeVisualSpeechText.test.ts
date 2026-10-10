import { safeVisualSpeechText } from './safeVisualSpeechText'

describe('safeVisualSpeechText', () => {
    it.each(['toby-diagram', 'mermaid', 'vega', 'vega-lite', 'jsxgraph', 'smiles', 'ketcher', 'latex'])(
        'filters explicit %s source while preserving surrounding prose',
        (language) => {
            const source = 'Look at this.\n```' + language + '\n{"private_value":91}\n```\nWhat do you notice?'
            expect(safeVisualSpeechText(source)).toBe('Look at this.\nVisual.\nWhat do you notice?')
            expect(source).toContain('"private_value":91')
        }
    )
    it.each(['toby-diagram json', 'TOBY-DIAGRAM {attrs}', 'mermaid\toptional', 'vega-lite{attrs}'])(
        'suppresses malformed reserved fence metadata: %s',
        (header) => {
            expect(safeVisualSpeechText('```' + header + '\n{"private_value":91}\n```')).toBe('Visual.\n')
        }
    )
    it('filters an unfinished visual fence and all of its remaining source', () => {
        expect(safeVisualSpeechText('First.\n```toby-diagram\n{"private_value":91')).toBe('First.\nVisual.\n')
    })
    it('recognises CRLF, tilde fences and a longer matching closing fence', () => {
        expect(safeVisualSpeechText('Before.\r\n   ~~~vega-lite\r\n{"private_value":91}\r\n  ~~~~~\r\nAfter.')).toBe(
            'Before.\r\nVisual.\nAfter.'
        )
    })
    it('does not close a visual with a shorter fence or another marker', () => {
        expect(safeVisualSpeechText('````toby-diagram\n{"private_value":91}\n```\n~~~\nsecret\n````\nAfter.')).toBe('Visual.\nAfter.')
    })
    it('preserves ordinary JSON/code examples byte for byte', () => {
        const text = 'Compare these.\r\n```json\r\n{"v":1,"p":{"a":4}}\r\n```\r\n```python\nx = 2\n```'
        expect(safeVisualSpeechText(text)).toBe(text)
    })
    it('keeps an ordinary outer code example opaque', () => {
        const text = '````text\n```toby-diagram\n{"p":{"a":4}}\n```\n````'
        expect(safeVisualSpeechText(text)).toBe(text)
    })
    it('does not recognise similar names or prose mentions as visual fences', () => {
        const text = 'The toby-diagram schema is versioned.\n```toby-diagram-example\n{"p":{"a":4}}\n```'
        expect(safeVisualSpeechText(text)).toBe(text)
    })
    it('preserves plain educational prose, punctuation and Unicode', () => {
        const text = 'What is ½ of 24?\nExplain how Δx changes.\n'
        expect(safeVisualSpeechText(text)).toBe(text)
        expect(safeVisualSpeechText('')).toBe('')
    })
    it('suppresses every explicit visual in one response', () => {
        expect(safeVisualSpeechText('```vega\n{"first":1}\n```\nThen.\n```toby-diagram\n{"second":2}\n```')).toBe(
            'Visual.\nThen.\nVisual.\n'
        )
    })
})
