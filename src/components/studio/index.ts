export { HoloStudio } from './studio'
export { HoloActivityBar } from './activity-bar'
export { HoloTree } from './tree'
export { HoloFileTabs } from './file-tabs'
export { HoloCodeView } from './code-view'
export { HoloFileView } from './file-view'
export { HoloGitPanel } from './git-panel'
export { HoloSplitPane } from './split-pane'
export { createExplorerPanel, createGitPanel } from './panels'
export type { CreateExplorerPanelOptions, CreateGitPanelOptions } from './panels'
export { flattenTree, inferFileKind, inferLanguageId, resolveFileIcon } from './utils'
export { openTab, pinTab, closeTab } from './utils'
export type { HoloFileTabsState } from './utils'

export type {
  HoloTreeNode,
  HoloTreeNodeStatus,
  HoloTreeProps,
  HoloNestedTreeNode,
  HoloFileKind,
  HoloStudioFile,
  HoloFileViewProps,
  HoloFileViewMode,
  HoloCodeRendererProps,
  HoloCodeViewProps,
  HoloFileTab,
  HoloFileTabsProps,
  HoloStudioPanel,
  HoloStudioProps,
  HoloActivityBarItem,
  HoloActivityBarProps,
  HoloGitFileState,
  HoloGitFileChange,
  HoloGitRepoState,
  HoloGitPanelProps,
  HoloSplitPaneProps,
} from './types'
