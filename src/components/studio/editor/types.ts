import type { HoloCodeRendererProps } from '../types'

export interface HoloCodeEditorProps extends HoloCodeRendererProps {
  /**
   * 追加的 CodeMirror 扩展。类型为 unknown[] 而不是 Extension[]，
   * 这样 ./studio 的类型声明不会引用 @codemirror/*，未安装 CM6 的消费者也能 typecheck。
   */
  extensions?: unknown[]
  /** 覆盖语言 id → LanguageSupport 的映射。 */
  languages?: Record<string, () => Promise<unknown>>
  /** Tab 缩进宽度。默认 2。 */
  tabSize?: number
  /** 是否启用搜索面板（Cmd/Ctrl+F）。默认 true。 */
  search?: boolean
}

export interface HoloDiffViewProps {
  before: string
  after: string
  languageId?: string
  /** 'unified' 使用 unifiedMergeView，'split' 使用 MergeView。默认 'split'。 */
  layout?: 'unified' | 'split'
  beforeLabel?: string
  afterLabel?: string
  readOnly?: boolean
  wrap?: boolean
  ariaLabel?: string
  className?: string
}
