import { useEffect, useRef } from 'react'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching, indentUnit } from '@codemirror/language'
import { highlightSelectionMatches, search, searchKeymap } from '@codemirror/search'
import { Annotation, Compartment, EditorState, type Extension } from '@codemirror/state'
import { Decoration, EditorView, keymap, lineNumbers, type DecorationSet } from '@codemirror/view'
import { useStudioLocale } from '../../utils/use-studio-locale'
import { resolveLanguage, studioEditorTheme, studioSyntaxHighlighting } from '../studio-editor-theme'
import type { HoloCodeEditorProps } from '../types'

const emphasisDecoration = Decoration.line({ class: 'cm-shd-emphasis-line' })

/** 标记「这次变更来自外部 value 同步」，使其不再回调 onChange，避免与宿主状态互相触发。 */
const externalSync = Annotation.define<boolean>()

function buildEmphasis(view: EditorView, lines: number[]): DecorationSet {
  const total = view.state.doc.lines
  const ranges = lines
    .filter(line => line >= 1 && line <= total)
    .sort((a, b) => a - b)
    .map(line => emphasisDecoration.range(view.state.doc.line(line).from))
  return Decoration.set(ranges)
}

function emphasisExtension(lines: number[]): Extension {
  // 用函数形态的 facet，让 CM6 在文档更新时自行重算行位置，
  // 避免每次输入都为了重映射装饰而额外 dispatch 一次。
  return EditorView.decorations.of(view => buildEmphasis(view, lines))
}

/**
 * 受控的 CodeMirror 6 编辑器。
 *
 * 受控要点：来自用户输入的变更通过 updateListener 上报，而父组件回传的相同内容
 * **不会**再次 dispatch，因此不会出现光标跳回行首。
 */
export function HoloCodeEditor({
  value,
  languageId,
  readOnly = false,
  onChange,
  onSaveIntent,
  highlightLines,
  revealLine,
  showLineNumbers = true,
  wrap = false,
  extensions,
  languages,
  tabSize = 2,
  search: enableSearch = true,
  ariaLabel,
  className = '',
}: HoloCodeEditorProps) {
  const locale = useStudioLocale()
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const languageCompartment = useRef(new Compartment())
  const emphasisCompartment = useRef(new Compartment())
  const readOnlyCompartment = useRef(new Compartment())
  const wrapCompartment = useRef(new Compartment())
  // 回调放在 ref 中，避免它们变化就重建整个 EditorView。
  const handlers = useRef({ onChange, onSaveIntent })
  handlers.current = { onChange, onSaveIntent }
  // extensions 只在挂载时读取一次。数组字面量每次渲染都是新引用，
  // 若纳入依赖会导致每次渲染都重建编辑器并丢失撤销栈与光标。
  const extraExtensions = useRef(extensions)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const base: Extension[] = [
      history(),
      bracketMatching(),
      highlightSelectionMatches(),
      indentUnit.of(' '.repeat(tabSize)),
      EditorState.tabSize.of(tabSize),
      keymap.of([
        {
          key: 'Mod-s',
          preventDefault: true,
          run: () => {
            handlers.current.onSaveIntent?.()
            return true
          },
        },
        ...(enableSearch ? searchKeymap : []),
        ...historyKeymap,
        ...defaultKeymap,
        indentWithTab,
      ]),
      studioEditorTheme,
      studioSyntaxHighlighting,
      languageCompartment.current.of([]),
      emphasisCompartment.current.of(emphasisExtension(highlightLines ?? [])),
      readOnlyCompartment.current.of([]),
      wrapCompartment.current.of([]),
      EditorView.updateListener.of(update => {
        if (!update.docChanged) return
        if (update.transactions.some(transaction => transaction.annotation(externalSync))) return
        handlers.current.onChange?.(update.state.doc.toString())
      }),
    ]
    if (showLineNumbers) base.push(lineNumbers())
    if (enableSearch) base.push(search())
    if (extraExtensions.current) base.push(...(extraExtensions.current as Extension[]))

    const view = new EditorView({ state: EditorState.create({ doc: value, extensions: base }), parent: host })
    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
    // 只在挂载与结构性选项变化时构建；value/language/readOnly 等通过 dispatch 同步。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableSearch, showLineNumbers, tabSize])

  // 外部 value 变化时同步文档，但跳过与当前内容相同的回传。
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current === value) return
    view.dispatch({ changes: { from: 0, to: current.length, insert: value }, annotations: externalSync.of(true) })
  }, [value])

  useEffect(() => {
    let cancelled = false
    resolveLanguage(languageId, languages).then(support => {
      const view = viewRef.current
      if (cancelled || !view) return
      view.dispatch({ effects: languageCompartment.current.reconfigure(support ?? []) })
    })
    return () => { cancelled = true }
  }, [languageId, languages])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      effects: readOnlyCompartment.current.reconfigure(
        readOnly ? [EditorState.readOnly.of(true), EditorView.editable.of(false)] : [],
      ),
    })
  }, [readOnly])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({ effects: wrapCompartment.current.reconfigure(wrap ? EditorView.lineWrapping : []) })
  }, [wrap])

  const emphasisKey = (highlightLines ?? []).join(',')
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    // 依赖序列化后的键：宿主传入行内数组字面量时不会每次渲染都 dispatch。
    view.dispatch({ effects: emphasisCompartment.current.reconfigure(emphasisExtension(emphasisKey === '' ? [] : emphasisKey.split(',').map(Number))) })
  }, [emphasisKey])

  useEffect(() => {
    const view = viewRef.current
    if (!view || revealLine === undefined) return
    if (revealLine < 1 || revealLine > view.state.doc.lines) return
    const line = view.state.doc.line(revealLine)
    view.dispatch({ selection: { anchor: line.from }, effects: EditorView.scrollIntoView(line.from, { y: 'center' }) })
  }, [revealLine])

  return (
    <div
      ref={hostRef}
      role="group"
      aria-label={ariaLabel ?? locale.editorLabel}
      className={`shd-surface-inset min-h-0 min-w-0 flex-1 ${className}`}
    />
  )
}
