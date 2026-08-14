export interface Locale {
  locale: string
  common: {
    confirm: string; cancel: string; close: string; loading: string; empty: string
    search: string; reset: string; submit: string; save: string; delete: string
    edit: string; more: string; expand: string; collapse: string; selectAll: string; notifications?: string
  }
  modal: { okText: string; cancelText: string }
  pagination: { total: string; itemsPerPage: string; goto: string; page: string; previous?: string; next?: string }
  table: { emptyText: string; sortAscend: string; sortDescend: string; filterConfirm: string; filterReset: string }
  select: { placeholder: string; noData: string; searchPlaceholder: string }
  upload: { dragText: string; clickText: string; limitText: string }
  datePicker: {
    placeholder: string; months: string[]; shortMonths: string[]
    weekdays: string[]; shortWeekdays: string[]; today: string; monthYearFormat: string
    previousMonth?: string; nextMonth?: string
  }
  chat: {
    inputPlaceholder: string; inputAriaLabel: string; sendButton: string; shiftEnterHint: string
    codeTab: string; previewTab: string
  }
  ai: {
    thinking: string; thinkingDescription: string; generating: string
    copy: string; copied: string; retry: string; stop: string
    newConversation: string; newConversationHint: string
    selectSession: string; selectSessionHint: string
    suggestCode: string; suggestExplain: string; suggestAnalyze: string
    toolRunning: string; toolComplete: string; toolError: string; toolPending: string
    preview: string
    artifactCode: string
    artifactPreview: string
    artifactDownload: string
    toolArguments: string
    toolResult: string
    toolNoResult: string
    toolGroupSummary: string
    toolGroupRunning: string
    toolGroupProgress: string
    toolGroupLabel: string
    taskExecutionLabel?: string
    taskExecutionProgress?: string
    taskExecutionProgressLabel?: string
    taskExecutionExpand?: string
    taskExecutionCollapse?: string
    taskCompleted?: string
    taskPending?: string
    taskRunning?: string
    taskError?: string
    taskCancelled?: string
    taskBlocked?: string
    taskSkipped?: string
    taskExecutionEmpty?: string
  }
  /** Studio project explorer surfaces. Optional so existing custom locales keep compiling. */
  studio?: {
    explorerTitle: string
    gitTitle: string
    noPanels: string
    collapsePanel: string
    expandPanel: string
    activityBarLabel: string
    treeLabel: string
    treeEmpty: string
    treeLoading: string
    treeLoadFailed: string
    treeRetry: string
    rename: string
    tabsLabel: string
    closeTab: string
    unsavedChanges: string
    noFileOpen: string
    unsupportedFile: string
    fileTooLarge: string
    loadingFile: string
    loadFileFailed: string
    codeLabel: string
    viewMode: string
    previewMode: string
    sourceMode: string
    editorLabel: string
    readOnlyBadge: string
    diffBefore: string
    diffAfter: string
    diffLabel: string
    resizeHandle: string
    gitConflicts: string
    gitStaged: string
    gitChanges: string
    gitUntracked: string
    gitEmpty: string
    gitStatusLabel: string
    gitCommit: string
    gitCommitPlaceholder: string
    gitCommitLabel: string
    gitAmend: string
    gitStage: string
    gitUnstage: string
    gitStageAll: string
    gitUnstageAll: string
    gitDiscard: string
    gitDiscardTitle: string
    gitDiscardConfirm: string
    gitResolve: string
    gitRefresh: string
    gitOpenDiff: string
    gitAhead: string
    gitBehind: string
    gitDetached: string
    gitNoBranch: string
    gitCommitNeedsMessage: string
    gitCommitNeedsStaged: string
    gitCommitBlockedByOperation: string
    gitStateModified: string
    gitStateAdded: string
    gitStateDeleted: string
    gitStateRenamed: string
    gitStateCopied: string
    gitStateTypeChanged: string
    gitStateUntracked: string
    gitStateIgnored: string
    gitStateConflicted: string
    gitInProgressMerge: string
    gitInProgressRebase: string
    gitInProgressCherryPick: string
    gitInProgressRevert: string
    gitInProgressBisect: string
  }
}
