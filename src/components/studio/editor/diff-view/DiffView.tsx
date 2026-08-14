import { useEffect, useRef } from 'react'
import { MergeView, unifiedMergeView } from '@codemirror/merge'
import { EditorState, type Extension } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { useStudioLocale } from '../../utils/use-studio-locale'
import { resolveLanguage, studioEditorTheme, studioSyntaxHighlighting } from '../studio-editor-theme'
import type { HoloDiffViewProps } from '../types'

/**
 * 差异标记。
 *
 * 选择器形状必须与 @codemirror/merge 自身一致：`cm-merge-a` / `cm-merge-b` 是**编辑器根节点**
 * 上的类，因此必须写成 `&.cm-merge-a ...`。写成 `.cm-merge-a ...` 会被 EditorView.theme
 * 编译成后代选择器而永远不命中——这曾导致整行底色失效、只剩下 token 描边。
 *
 * 视觉上采用标准 diff 语义：变更行一层低填充底色，变更 token 用同色系更重的一层底色，
 * 而不是给每个 token 描边（描边会在密集差异上形成噪点，且青色是识别色，与增删语义无关）。
 * 全部颜色由 --shd-status-* 经 color-mix 派生，随主题联动。
 */
const removedLine = 'color-mix(in srgb, var(--shd-status-error) 10%, transparent)'
const removedText = 'color-mix(in srgb, var(--shd-status-error) 26%, transparent)'
const addedLine = 'color-mix(in srgb, var(--shd-status-success) 10%, transparent)'
const addedText = 'color-mix(in srgb, var(--shd-status-success) 26%, transparent)'

const diffTheme: Extension = EditorView.theme({
  '&.cm-merge-a .cm-changedLine, .cm-deletedChunk': {
    backgroundColor: removedLine,
    boxShadow: 'inset 2px 0 0 var(--shd-stroke-error)',
  },
  '&.cm-merge-b .cm-changedLine, .cm-inlineChangedLine': {
    backgroundColor: addedLine,
    boxShadow: 'inset 2px 0 0 var(--shd-stroke-success)',
  },
  '&.cm-merge-a .cm-changedText, & .cm-deletedChunk .cm-deletedText': {
    background: removedText,
    borderRadius: '2px',
  },
  '&.cm-merge-b .cm-changedText': {
    background: addedText,
    borderRadius: '2px',
  },
  '&.cm-merge-a .cm-changedLineGutter, & .cm-deletedLineGutter': {
    backgroundColor: removedLine,
    color: 'var(--shd-status-error)',
  },
  '&.cm-merge-b .cm-changedLineGutter': {
    backgroundColor: addedLine,
    color: 'var(--shd-status-success)',
  },
  '.cm-inlineChangedLineGutter': { color: 'var(--shd-status-success)' },
  '.cm-merge-revert': {
    backgroundColor: 'var(--shd-surface-raised)',
    borderColor: 'var(--shd-stroke-muted)',
    color: 'var(--shd-content-tertiary)',
  },
  '.cm-merge-spacer': { backgroundColor: 'var(--shd-surface-base)' },
})

function SideLabel({ children }: { children: string }) {
  return (
    <span className="min-w-0 flex-1 truncate border-b border-stroke-muted bg-surface-base px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">
      {children}
    </span>
  )
}

export function HoloDiffView({
  before,
  after,
  languageId,
  layout = 'split',
  beforeLabel,
  afterLabel,
  readOnly = true,
  wrap = false,
  ariaLabel,
  className = '',
}: HoloDiffViewProps) {
  const locale = useStudioLocale()
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    let instance: { destroy(): void } | null = null

    resolveLanguage(languageId).then(language => {
      if (disposed || !hostRef.current) return
      const shared: Extension[] = [
        lineNumbers(),
        studioEditorTheme,
        studioSyntaxHighlighting,
        diffTheme,
        ...(wrap ? [EditorView.lineWrapping] : []),
        ...(language ? [language] : []),
        ...(readOnly ? [EditorState.readOnly.of(true), EditorView.editable.of(false)] : []),
      ]

      if (layout === 'unified') {
        instance = new EditorView({
          state: EditorState.create({ doc: after, extensions: [unifiedMergeView({ original: before }), ...shared] }),
          parent: hostRef.current,
        })
        return
      }
      /*
       * 不要试图把两侧编辑器拉伸到容器高度。@codemirror/merge 的 baseTheme 显式声明了
       *   .cm-mergeView & .cm-scroller, .cm-mergeView & { height: auto !important }
       * 这是它的设计：两侧必须同步滚动，因此由 MergeView 外层滚动，而不是各自滚动。
       * 所以 diff 内容按自身高度排布，滚动交给本组件的 host 容器（overflow + shd-scrollbar）。
       */
      instance = new MergeView({
        a: { doc: before, extensions: [...shared, EditorState.readOnly.of(true), EditorView.editable.of(false)] },
        b: { doc: after, extensions: shared },
        parent: hostRef.current,
      })
    })

    return () => {
      disposed = true
      instance?.destroy()
      instance = null
    }
  }, [after, before, languageId, layout, readOnly, wrap])

  return (
    <div role="group" aria-label={ariaLabel ?? locale.diffLabel} className={`flex min-h-0 min-w-0 flex-1 flex-col ${className}`}>
      {layout === 'split' && <div className="flex flex-none">
        <SideLabel>{beforeLabel ?? locale.diffBefore}</SideLabel>
        <SideLabel>{afterLabel ?? locale.diffAfter}</SideLabel>
      </div>}
      <div ref={hostRef} className="shd-scrollbar shd-surface-inset min-h-0 flex-1 overflow-auto" />
    </div>
  )
}
