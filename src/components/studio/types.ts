import type { ComponentType, MouseEvent, ReactNode } from 'react'
import type { ArtifactSource } from '@/types'

/* ------------------------------------------------------------------ tree */

/**
 * 树节点的语义状态。与 Git 状态刻意保持独立命名，
 * 因为树也用于非版本控制场景，宿主负责映射。
 */
export type HoloTreeNodeStatus =
  | 'default'
  | 'added'
  | 'modified'
  | 'deleted'
  | 'renamed'
  | 'untracked'
  | 'ignored'
  | 'conflicted'
  | 'error'

/** 树节点。通用设计，不绑定文件语义——同一组件可渲染符号大纲、Agent 列表等。 */
export interface HoloTreeNode {
  /** 全局唯一。文件场景通常直接用路径，但组件不对其做任何路径解析。 */
  id: string
  /** 父节点 id；根节点省略。 */
  parentId?: string
  /** 显示文本。 */
  label: string
  /** leaf 无展开箭头；branch 可展开。 */
  kind: 'leaf' | 'branch'
  /**
   * branch 是否可展开。未提供时组件按「是否已存在子节点或已声明 loadChildren」推断，
   * 用于表达「已知是目录但尚未探测过内容」。
   */
  expandable?: boolean
  /** 宿主正在获取该节点子项时置 true，组件在开合器位置渲染 spinner。 */
  loading?: boolean
  /** 该节点的加载错误信息；非空时渲染错误态并保持可重试。 */
  error?: string
  /** 自定义图标。省略时由 resolveFileIcon 按 label 推断。 */
  icon?: ReactNode
  /** 语义状态标记，驱动着色。 */
  status?: HoloTreeNodeStatus
  /** 附加计数或标记，渲染在行尾。 */
  badge?: string | number
  /** 是否禁用交互。 */
  disabled?: boolean
  /** 宿主自带数据，组件原样透传回调，绝不读取。 */
  meta?: unknown
}

/** 嵌套形态的树节点，仅用于 flattenTree 的入参。 */
export interface HoloNestedTreeNode extends Omit<HoloTreeNode, 'parentId'> {
  children?: HoloNestedTreeNode[]
}

export interface HoloTreeProps {
  /** 扁平节点数组。顺序即同层显示顺序，组件不做排序。 */
  nodes: HoloTreeNode[]
  /** 已展开的节点 id。 */
  expandedIds: string[]
  onExpandedChange(ids: string[]): void
  /** 选中的节点 id。单选时长度 0 或 1。 */
  selectedIds?: string[]
  onSelectedChange?(ids: string[]): void
  /** 是否允许多选（Ctrl/Cmd 与 Shift）。默认 false。 */
  multiple?: boolean
  /** 单击/方向键落点变化时触发（聚焦语义）。 */
  onFocusNode?(node: HoloTreeNode): void
  /** 激活：双击、Enter，或单击（受 activateOn 控制）。 */
  onActivate?(node: HoloTreeNode): void
  /**
   * 「打开并保持」意图。仅在 activateOn === 'click' 时由双击触发
   * （默认的 doubleClick 模式下双击本身就是普通打开，不会再触发这个）。
   * 用于实现预览标签 / 固定标签：单击预览、双击固定。
   */
  onActivatePinned?(node: HoloTreeNode): void
  /** 激活触发方式。默认 'doubleClick'（目录单击仅展开）。 */
  activateOn?: 'click' | 'doubleClick'
  /** 右键菜单交由宿主实现，组件仅上报。 */
  onContextMenu?(node: HoloTreeNode, event: MouseEvent): void
  /** 可选惰性加载。提供时，展开未加载的 branch 会调用它。 */
  loadChildren?(node: HoloTreeNode): Promise<HoloTreeNode[]>
  /** （受控）已加载完成的 branch id 集合。移除某 id 即可强制重取。 */
  loadedIds?: string[]
  onLoadedIdsChange?(ids: string[]): void
  /** loadChildren 成功后触发，宿主据此合并节点。 */
  onChildrenLoaded?(parent: HoloTreeNode, children: HoloTreeNode[]): void
  /** loadChildren 失败后触发。 */
  onLoadError?(parent: HoloTreeNode, error: unknown): void
  /** 内联重命名。提供时节点支持 F2 进入编辑态。 */
  onRename?(node: HoloTreeNode, nextLabel: string): void
  /** 行高（px）。虚拟滚动依赖固定行高。默认 24。 */
  rowHeight?: number
  /** 每级缩进（px）。默认 12。 */
  indent?: number
  /** 空态内容。省略时使用 HoloEmpty 与 locale.studio.treeEmpty。 */
  emptyContent?: ReactNode
  /** 无障碍标签。 */
  ariaLabel?: string
  className?: string
}

/* ------------------------------------------------------- file semantics */

/** 文件呈现种类。用于决定主区用什么渲染器。 */
export type HoloFileKind =
  | 'code'
  | 'markdown'
  | 'pdf'
  | 'spreadsheet'
  | 'image'
  | 'svg'
  | 'html'
  | 'binary'

/** 主区要呈现的文件描述。内容由宿主供给，组件不读盘。 */
export interface HoloStudioFile {
  /** 与树节点 id 对齐，通常是路径。 */
  id: string
  /** 显示用文件名。 */
  fileName: string
  /** 覆盖自动推断的种类。 */
  kind?: HoloFileKind
  /** 覆盖自动推断的语言 id。 */
  languageId?: string
  mimeType?: string
  /** 内容来源。复用库内既有的 ArtifactSource。 */
  source: ArtifactSource
  /**
   * 是否有未保存修改。由宿主判定。
   *
   * 这是**给宿主看的元数据**：HoloFileView 不渲染它。未保存状态的呈现在标签上，
   * 宿主把它转写到 `HoloFileTab.dirty` 即可（圆点 + aria-describedby 说明）。
   */
  dirty?: boolean
  /** 是否只读。true 时即便注入了编辑器也强制只读。 */
  readOnly?: boolean
  /** 字节大小；提供时用于提前触发 maxRenderBytes 判定。 */
  byteSize?: number
  meta?: unknown
}

/** HoloFileView 的呈现模式。 */
export type HoloFileViewMode = 'preview' | 'source'

/** 代码渲染器契约。HoloCodeView 与 HoloCodeEditor 均实现它，因此可互换注入。 */
export interface HoloCodeRendererProps {
  value: string
  languageId?: string
  readOnly?: boolean
  onChange?(value: string): void
  onSaveIntent?(): void
  /** 需要高亮强调的行号（1-based）。 */
  highlightLines?: number[]
  /** 挂载后滚动并聚焦到该行（1-based）。 */
  revealLine?: number
  /** 是否显示行号。默认 true。 */
  showLineNumbers?: boolean
  /** 是否软换行。默认 false。 */
  wrap?: boolean
  ariaLabel?: string
  className?: string
}

/** HoloCodeView 的完整 Props：渲染器契约 + 只读视图专有的体积兜底。 */
export interface HoloCodeViewProps extends HoloCodeRendererProps {
  /** 超过该字节数则不高亮、不渲染正文，改渲染占位。默认 512 * 1024。 */
  maxRenderBytes?: number
  /** 已知字节大小；提供时优先使用，避免为判定而先计算 Blob。 */
  byteSize?: number
  onExceedLimit?(byteSize: number): void
}

export interface HoloFileViewProps {
  /** 当前文件；null 渲染空态。 */
  file: HoloStudioFile | null
  /**
   * 代码渲染器。传入 HoloCodeEditor 即获得编辑能力；
   * 省略则使用内置只读 HoloCodeView。
   */
  codeRenderer?: ComponentType<HoloCodeRendererProps>
  /**
   * 按 kind 覆盖渲染器。与 ArtifactPreviewDrawer 的 renderers 扩展点风格一致。
   */
  renderers?: Partial<Record<string, (file: HoloStudioFile) => ReactNode>>
  /** 受控编辑内容变更。仅当 codeRenderer 可编辑时触发。 */
  onChange?(file: HoloStudioFile, value: string): void
  /** Cmd/Ctrl+S 意图。组件不做任何持久化。 */
  onSaveIntent?(file: HoloStudioFile): void
  /** 空态内容。 */
  emptyContent?: ReactNode
  /** 传递给代码渲染器的字节上限。默认 512 * 1024。 */
  maxRenderBytes?: number
  onExceedLimit?(file: HoloStudioFile, byteSize: number): void
  /**
   * 呈现模式（受控）。'preview' 用渲染视图，'source' 用代码渲染器看/改源码。
   * 只有既有渲染视图、内容又是文本的 kind 才可切换（markdown / svg / html）；
   * code 只有源码、pdf / spreadsheet / image / binary 只有预览，两者都不显示切换器。
   */
  mode?: HoloFileViewMode
  onModeChange?(mode: HoloFileViewMode): void
  /** 非受控初始模式。默认 'preview'。 */
  defaultMode?: HoloFileViewMode
  /** 是否显示内置的模式切换器。默认 true（仅在该文件可切换时出现）。 */
  showModeToggle?: boolean
  className?: string
}

/* ------------------------------------------------------------ file tabs */

export interface HoloFileTab {
  id: string
  label: string
  icon?: ReactNode
  dirty?: boolean
  /** 悬浮提示，通常放完整路径。 */
  title?: string
  /**
   * 预览标签（未固定）。同一时刻至多一个，单击打开新文件会**原地替换**它。
   * 双击标签、或宿主在文件被编辑时调用 pinTab 即可固定。渲染为斜体，与 VS Code 一致。
   * 状态机见 openTab / pinTab / closeTab。
   */
  preview?: boolean
}

export interface HoloFileTabsProps {
  tabs: HoloFileTab[]
  activeId?: string
  onActiveChange?(id: string): void
  onClose?(id: string): void
  /** 是否显示关闭按钮。默认 true。 */
  closable?: boolean
  /** 中键点击关闭。默认 true。 */
  closeOnMiddleClick?: boolean
  onContextMenu?(tab: HoloFileTab, event: MouseEvent): void
  /**
   * 请求固定某个预览标签。双击标签时触发，与 VS Code 的手势一致。
   * 宿主收到后调用 pinTab 即可。
   */
  onPin?(id: string): void
  ariaLabel?: string
  className?: string
}

/* ------------------------------------------------------ shell & panels */

/**
 * Activity Bar 面板描述符。这就是扩展机制本身——
 * 不存在 register/unregister 注册表。内置面板与下游手写对象完全同构。
 */
export interface HoloStudioPanel {
  id: string
  /** 侧栏图标。建议 16×16 的 currentColor SVG。 */
  icon: ReactNode
  /** 图标 tooltip 与面板标题。 */
  title: string
  /** 面板体。惰性调用——仅在该面板处于激活态时求值。 */
  render(): ReactNode
  /** 图标上的角标。 */
  badge?: string | number
  /** 侧栏中的位置分区。默认 'top'。 */
  placement?: 'top' | 'bottom'
  /** 面板头部右侧的操作区。 */
  actions?: ReactNode
  /** 是否禁用。 */
  disabled?: boolean
}

/** Activity Bar 只需要面板描述符的一个子集。 */
export type HoloActivityBarItem = Pick<HoloStudioPanel, 'id' | 'icon' | 'title' | 'badge' | 'placement' | 'disabled'>

export interface HoloActivityBarProps {
  /** 图标项。通常直接传 HoloStudioPanel[]，因为字段是其子集。 */
  items: HoloActivityBarItem[]
  activeId?: string
  onActiveChange?(id: string): void
  /** 点击当前已激活项时触发，HoloStudio 用它实现「折叠侧栏」。 */
  onActiveReselect?(id: string): void
  /** 关联的面板容器 id，用于 aria-controls。 */
  panelContainerId?: string
  ariaLabel?: string
  className?: string
}

export interface HoloStudioProps {
  /** 面板列表。省略时侧边面板渲染空态。 */
  panels?: HoloStudioPanel[]
  /** 受控激活面板。 */
  activePanelId?: string
  onActivePanelChange?(id: string): void
  /** 非受控初始激活面板。省略时取第一个 placement==='top' 的面板。 */
  defaultActivePanelId?: string
  /** 侧边面板是否折叠（受控）。 */
  sideCollapsed?: boolean
  onSideCollapsedChange?(collapsed: boolean): void
  /** 侧边面板宽度（px，受控）。 */
  sideWidth?: number
  onSideWidthChange?(width: number): void
  /** 宽度约束。默认 min 180 / max 520 / default 260。 */
  minSideWidth?: number
  maxSideWidth?: number
  defaultSideWidth?: number
  /** 主内容区。 */
  children?: ReactNode
  /** 主内容区上方的标签栏等固定内容。 */
  header?: ReactNode
  /** 底部状态条。 */
  footer?: ReactNode
  className?: string
}

/* ------------------------------------------------------------------ git */

/** 单侧（index 或 worktree）的文件状态，对应 git status --porcelain 的状态字符。 */
export type HoloGitFileState =
  | 'modified'
  | 'added'
  | 'deleted'
  | 'renamed'
  | 'copied'
  | 'typeChanged'
  | 'untracked'
  | 'ignored'
  | 'conflicted'

export interface HoloGitFileChange {
  /** 仓库相对路径。 */
  path: string
  /**
   * 暂存区（index）侧状态。undefined 表示该文件在 index 中无变更。
   * indexState 与 worktreeState 同时非空，即 git 特有的
   * 「同一文件既有已暂存修改、又有未暂存修改」，该文件会同时出现在两个分组中。
   */
  indexState?: HoloGitFileState
  /** 工作区（worktree）侧状态。undefined 表示变更已全部暂存。 */
  worktreeState?: HoloGitFileState
  /** 重命名 / 复制的来源路径。 */
  originalPath?: string
  /** 冲突时的双方标记，用于渲染 ours/theirs 提示。 */
  conflict?: { ours: boolean; theirs: boolean }
  /** 是否为子模块。仅用于渲染区分。 */
  submodule?: boolean
  meta?: unknown
}

/** 仓库整体状态。全部只用于展示，组件不提供任何触发操作的入口。 */
export interface HoloGitRepoState {
  branch?: string
  upstream?: string
  ahead?: number
  behind?: number
  /** HEAD 处于分离状态。 */
  detached?: boolean
  /** git 特有的中间态。非空时禁止提交并渲染提示。 */
  inProgress?: 'merge' | 'rebase' | 'cherry-pick' | 'revert' | 'bisect'
}

export interface HoloGitPanelProps {
  repo: HoloGitRepoState
  /** 全部变更条目。分组由组件按 indexState/worktreeState 计算，宿主不需要预分组。 */
  changes: HoloGitFileChange[]
  /** 受控提交信息。 */
  commitMessage: string
  onCommitMessageChange(value: string): void
  onStage?(paths: string[]): void
  onUnstage?(paths: string[]): void
  /** 丢弃工作区修改。组件内部走 HoloConfirm 二次确认。 */
  onDiscard?(paths: string[]): void
  /** 打开某文件的 diff。side 指明看 index 还是 worktree 侧。 */
  onOpenDiff?(path: string, side: 'index' | 'worktree'): void
  /** 提交。amend 由面板内的复选框驱动。 */
  onCommit?(options: { amend: boolean }): void
  onRefresh?(): void
  /** 点击条目（非 diff）时上报，宿主可用于在主区打开文件。 */
  onSelectChange?(change: HoloGitFileChange): void
  /** 有异步操作进行中，禁用交互并显示进度。 */
  busy?: boolean
  /** 错误信息，渲染为 HoloAlert。 */
  error?: string
  /** 暂存区为空时是否仍允许提交。默认 false。 */
  allowEmptyCommit?: boolean
  /** 空态内容。 */
  emptyContent?: ReactNode
  className?: string
}

/* ------------------------------------------------------------ split pane */

export interface HoloSplitPaneProps {
  /** 分栏方向。默认 'horizontal'（左右）。 */
  direction?: 'horizontal' | 'vertical'
  /** 第一栏尺寸（px，受控）。 */
  size?: number
  onSizeChange?(size: number): void
  defaultSize?: number
  minSize?: number
  maxSize?: number
  /** 双击分隔条时重置到 defaultSize。默认 true。 */
  resetOnDoubleClick?: boolean
  /** 恰好两个子节点。 */
  children: [ReactNode, ReactNode]
  ariaLabel?: string
  className?: string
}
