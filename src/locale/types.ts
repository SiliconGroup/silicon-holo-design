export interface Locale {
  locale: string
  common: {
    confirm: string; cancel: string; close: string; loading: string; empty: string
    search: string; reset: string; submit: string; save: string; delete: string
    edit: string; more: string; expand: string; collapse: string; selectAll: string
  }
  modal: { okText: string; cancelText: string }
  pagination: { total: string; itemsPerPage: string; goto: string; page: string }
  table: { emptyText: string; sortAscend: string; sortDescend: string; filterConfirm: string; filterReset: string }
  select: { placeholder: string; noData: string; searchPlaceholder: string }
  upload: { dragText: string; clickText: string; limitText: string }
  datePicker: {
    placeholder: string; months: string[]; shortMonths: string[]
    weekdays: string[]; shortWeekdays: string[]; today: string; monthYearFormat: string
  }
  ai: {
    thinking: string; thinkingDescription: string; generating: string
    copy: string; copied: string; retry: string; stop: string
    newConversation: string; newConversationHint: string
    selectSession: string; selectSessionHint: string
    inputPlaceholder: string; inputAriaLabel: string; sendButton: string; shiftEnterHint: string
    suggestCode: string; suggestExplain: string; suggestAnalyze: string
    toolRunning: string; toolComplete: string; toolError: string; toolPending: string
    codeTab: string; previewTab: string
  }
}
