import { describe, expect, it } from 'vitest'
import hljs from 'highlight.js'
import { splitHighlightedLines } from './code-highlight'

describe('splitHighlightedLines', () => {
  it('returns one entry for a single line', () => {
    expect(splitHighlightedLines('const a = 1')).toEqual(['const a = 1'])
  })

  it('splits plain text on newlines', () => {
    expect(splitHighlightedLines('a\nb\nc')).toEqual(['a', 'b', 'c'])
  })

  it('preserves trailing empty lines', () => {
    expect(splitHighlightedLines('a\n\n')).toEqual(['a', '', ''])
  })

  it('keeps single-line spans intact', () => {
    expect(splitHighlightedLines('<span class="hljs-keyword">const</span> a')).toEqual(['<span class="hljs-keyword">const</span> a'])
  })

  it('closes and reopens spans that straddle a newline', () => {
    expect(splitHighlightedLines('<span class="hljs-comment">/*\n * x\n */</span>')).toEqual([
      '<span class="hljs-comment">/*</span>',
      '<span class="hljs-comment"> * x</span>',
      '<span class="hljs-comment"> */</span>',
    ])
  })

  it('handles nested spans across newlines', () => {
    expect(splitHighlightedLines('<span class="a"><span class="b">1\n2</span></span>')).toEqual([
      '<span class="a"><span class="b">1</span></span>',
      '<span class="a"><span class="b">2</span></span>',
    ])
  })

  it('leaves every line balanced for real highlight.js output', () => {
    const source = 'function main() {\n  /* block\n     comment */\n  const s = `multi\n  line`\n}\n'
    const lines = splitHighlightedLines(hljs.highlight(source, { language: 'typescript' }).value)
    expect(lines).toHaveLength(source.split('\n').length)
    for (const line of lines) {
      const open = (line.match(/<span\b/g) ?? []).length
      const close = (line.match(/<\/span>/g) ?? []).length
      expect(close, line).toBe(open)
    }
  })

  it('does not treat self-closing tags as openers', () => {
    expect(splitHighlightedLines('a<br />\nb')).toEqual(['a<br />', 'b'])
  })

  it('returns a single empty entry for empty input', () => {
    expect(splitHighlightedLines('')).toEqual([''])
  })
})
