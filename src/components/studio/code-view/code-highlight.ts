const TOKEN = /(<\/?[^>]+>)|([^<]+)/g
const OPEN_TAG = /^<([a-zA-Z][\w-]*)/
const SELF_CLOSING = /\/\s*>$/

/**
 * 把 highlight.js 输出的整段 HTML 按行切分。
 *
 * 不能直接 `html.split('\n')`：块注释、模板字符串等跨行结构的 `<span>` 会被切成
 * 不闭合的碎片。这里在换行处关闭当前所有打开的标签，并在下一行原样重开它们，
 * 使每一行都是自洽的 HTML 片段。
 */
export function splitHighlightedLines(html: string): string[] {
  const lines: string[] = []
  const stack: { name: string; raw: string }[] = []
  let current = ''

  const closeAll = () => stack.map(entry => `</${entry.name}>`).reverse().join('')
  const openAll = () => stack.map(entry => entry.raw).join('')

  for (const match of html.matchAll(TOKEN)) {
    const [, tag, text] = match
    if (tag !== undefined) {
      current += tag
      if (SELF_CLOSING.test(tag)) continue
      if (tag.startsWith('</')) stack.pop()
      else {
        const name = OPEN_TAG.exec(tag)?.[1]
        if (name) stack.push({ name, raw: tag })
      }
      continue
    }
    if (text === undefined) continue
    const segments = text.split('\n')
    segments.forEach((segment, index) => {
      if (index > 0) {
        lines.push(current + closeAll())
        current = openAll()
      }
      current += segment
    })
  }

  lines.push(current + closeAll())
  return lines
}
