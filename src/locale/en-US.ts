import type { Locale } from './types'
const enUS: Locale = {
  locale: 'en-US',
  common: {
    confirm: 'Confirm', cancel: 'Cancel', close: 'Close', loading: 'Loading', empty: 'No data',
    search: 'Search', reset: 'Reset', submit: 'Submit', save: 'Save', delete: 'Delete',
    edit: 'Edit', more: 'More', expand: 'Expand', collapse: 'Collapse', selectAll: 'Select All',
  },
  modal: { okText: 'OK', cancelText: 'Cancel' },
  pagination: { total: 'Total {total} items', itemsPerPage: 'items/page', goto: 'Go to', page: 'Page' },
  table: { emptyText: 'No data', sortAscend: 'Ascending', sortDescend: 'Descending', filterConfirm: 'OK', filterReset: 'Reset' },
  select: { placeholder: 'Select...', noData: 'No data', searchPlaceholder: 'Search...' },
  upload: { dragText: 'Click or drag files here', clickText: 'Click to upload', limitText: 'Max {limit} files' },
  datePicker: {
    placeholder: 'Select date',
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    shortMonths: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    weekdays: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    shortWeekdays: ['Su','Mo','Tu','We','Th','Fr','Sa'],
    today: 'Today', monthYearFormat: '{month} {year}',
  },
  ai: {
    thinking: 'Thinking', thinkingDescription: 'AI is processing your request...',
    generating: 'Generating', copy: 'Copy', copied: 'Copied', retry: 'Retry', stop: 'Stop',
    newConversation: 'Start a new conversation', newConversationHint: 'Type a message to chat with AI',
    selectSession: 'Select or create a session', selectSessionHint: 'Select an existing session or create a new one to start chatting',
    inputPlaceholder: 'Type a message...', inputAriaLabel: 'Chat message input',
    sendButton: 'Send', shiftEnterHint: 'Shift+Enter for new line',
    suggestCode: 'Write code', suggestExplain: 'Explain concept', suggestAnalyze: 'Analyze problem',
    toolRunning: 'Running...', toolComplete: 'Complete', toolError: 'Failed', toolPending: 'Pending',
    codeTab: 'Code', previewTab: 'Preview',
  },
}
export default enUS
