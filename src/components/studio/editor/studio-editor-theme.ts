import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags } from '@lezer/highlight'
import type { Extension } from '@codemirror/state'
import { studioLanguageSupport } from './language-support'

/**
 * 全部颜色都取自 --shd-* 变量，因此编辑器会随 ThemeProvider 的语义令牌覆盖而变化。
 * 禁止在此硬编码色值。
 */
export const studioEditorTheme: Extension = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: 'var(--shd-surface-inset)',
    color: 'var(--shd-content-primary)',
    fontSize: '13px',
  },
  '.cm-scroller': {
    fontFamily: 'var(--shd-font-mono, "JetBrains Mono", "Fira Code", monospace)',
    lineHeight: '1.6',
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--shd-stroke-default) transparent',
  },
  '.cm-content': { caretColor: 'var(--shd-accent-primary)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--shd-accent-primary)' },
  '.cm-gutters': {
    backgroundColor: 'var(--shd-surface-inset)',
    color: 'var(--shd-content-disabled)',
    border: 'none',
    borderRight: '1px solid var(--shd-stroke-muted)',
  },
  '.cm-activeLine': { backgroundColor: 'var(--shd-accent-primary-softer)' },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--shd-accent-primary-softer)',
    color: 'var(--shd-content-tertiary)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--shd-surface-selected)',
  },
  '.cm-selectionMatch': { backgroundColor: 'var(--shd-accent-primary-soft)' },
  '.cm-searchMatch': {
    backgroundColor: 'var(--shd-accent-primary-soft)',
    outlineWidth: '1px',
    outlineStyle: 'solid',
    outlineColor: 'var(--shd-stroke-accent)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: 'var(--shd-accent-primary)' },
  '.cm-panels': {
    backgroundColor: 'var(--shd-surface-raised)',
    color: 'var(--shd-content-secondary)',
    borderColor: 'var(--shd-stroke-muted)',
  },
  '.cm-panels input, .cm-panels button': {
    backgroundColor: 'var(--shd-surface-interactive)',
    color: 'var(--shd-content-primary)',
    border: '1px solid var(--shd-stroke-default)',
    borderRadius: 'var(--shd-radius-sm)',
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--shd-surface-overlay)',
    color: 'var(--shd-content-primary)',
    border: '1px solid var(--shd-stroke-default)',
  },
  '.cm-shd-emphasis-line': { backgroundColor: 'var(--shd-accent-primary-softer)' },
  '&.cm-editor.cm-focused': { outlineStyle: 'none' },
}, { dark: true })

/** 语法着色与 .shd-markdown-code-block .hljs-* 的既有配色保持一致。 */
const studioHighlightStyle = HighlightStyle.define([
  { tag: [tags.comment, tags.lineComment, tags.blockComment, tags.docComment], color: 'var(--shd-content-tertiary)', fontStyle: 'italic' },
  { tag: [tags.keyword, tags.modifier, tags.controlKeyword, tags.operatorKeyword, tags.definitionKeyword], color: 'var(--shd-accent-purple)' },
  { tag: [tags.string, tags.special(tags.string), tags.regexp], color: 'color-mix(in srgb, var(--shd-status-success) 64%, var(--shd-content-secondary))' },
  { tag: [tags.number, tags.bool, tags.null, tags.atom, tags.variableName], color: 'color-mix(in srgb, var(--shd-status-warning) 68%, var(--shd-content-secondary))' },
  { tag: [tags.typeName, tags.className, tags.standard(tags.typeName), tags.function(tags.variableName), tags.function(tags.propertyName)], color: 'var(--shd-accent-blue)' },
  { tag: [tags.propertyName, tags.attributeName, tags.tagName], color: 'var(--shd-content-accent)' },
  { tag: [tags.operator, tags.punctuation, tags.separator, tags.bracket], color: 'var(--shd-content-tertiary)' },
  { tag: [tags.heading, tags.strong], color: 'var(--shd-content-primary)', fontWeight: '600' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.link, color: 'var(--shd-content-accent)', textDecoration: 'underline' },
  { tag: tags.invalid, color: 'var(--shd-status-error)' },
])

export const studioSyntaxHighlighting: Extension = syntaxHighlighting(studioHighlightStyle, { fallback: true })

/**
 * 解析语言支持。未命中映射时不加载语言（纯文本），不报错。
 * 返回 null 表示该语言无可用支持。
 */
export async function resolveLanguage(
  languageId: string | undefined,
  overrides?: Record<string, () => Promise<unknown>>,
): Promise<Extension | null> {
  if (!languageId) return null
  const loader = overrides?.[languageId] ?? studioLanguageSupport[languageId]
  if (!loader) return null
  try {
    const support = await loader()
    return (support ?? null) as Extension | null
  } catch {
    // 语言包缺失不应让编辑器不可用，降级为纯文本。
    return null
  }
}
