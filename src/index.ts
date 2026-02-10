// Styles
import './styles/base.css'
import './styles/animations.css'

// Types
export type { Size, Status, MessageRole, ChatMessage, ConnectionStatus, ToolStatus } from './types'

// Locale
export { LocaleProvider, useLocale, formatMessage, enUS, zhCN } from './locale/index'
export type { Locale } from './locale/index'

// Theme
export { ThemeProvider, useTheme, defaultTokens } from './theme/index'
export type { ThemeTokens } from './theme/index'

// Utils
export { cn } from './utils/cn'
export { HoloPortal } from './utils/portal'

// Hooks
export { useClickOutside } from './hooks'

// General
export { HoloButton } from './components/general/button'
export { HoloLink } from './components/general/link'
export { GlowCard } from './components/general/glow-card'
export { IconButton } from './components/general/icon-button'
export { CircuitBorder } from './components/general/circuit-border'

// Layout
export { HoloDivider } from './components/layout/divider'
export { HoloSpace } from './components/layout/space'
export { HoloScrollArea } from './components/layout/scroll-area'

// Navigation
export { HoloBreadcrumb } from './components/navigation/breadcrumb'
export { HoloDropdown } from './components/navigation/dropdown'
export { HoloPagination } from './components/navigation/pagination'
export { HoloSteps } from './components/navigation/steps'
export { HoloTab } from './components/navigation/tabs'
export { HoloAnchor } from './components/navigation/anchor'

// Data Entry
export { HoloInput } from './components/data-entry/input'
export type { HoloInputProps } from './components/data-entry/input'
export { HoloTextarea } from './components/data-entry/textarea'
export type { HoloTextareaProps } from './components/data-entry/textarea'
export { HoloInputGroup, HoloInputAddon } from './components/data-entry/input-group'
export { HoloSelect } from './components/data-entry/select'
export { HoloCheckbox } from './components/data-entry/checkbox'
export { HoloRadio } from './components/data-entry/radio'
export { HoloRadioGroup } from './components/data-entry/radio-group'
export { HoloSwitch } from './components/data-entry/switch'
export { HoloSlider } from './components/data-entry/slider'
export { HoloNumberInput } from './components/data-entry/number-input'
export { HoloDatePicker } from './components/data-entry/date-picker'
export { HoloUpload } from './components/data-entry/upload'
export { HoloForm } from './components/data-entry/form'
export { HoloFormItem } from './components/data-entry/form-item'

// Data Display
export { HoloTable } from './components/data-display/table'
export { HoloTag } from './components/data-display/tag'
export { HoloBadge } from './components/data-display/badge'
export { HoloAvatar } from './components/data-display/avatar'
export { HoloDescriptions } from './components/data-display/descriptions'
export { HoloTimeline } from './components/data-display/timeline'
export { HoloCollapse } from './components/data-display/collapse'
export { HoloTooltip } from './components/data-display/tooltip'
export { HoloPopover } from './components/data-display/popover'
export { HoloEmpty } from './components/data-display/empty'
export { HoloKbd } from './components/data-display/kbd'
export { StatusIndicator } from './components/data-display/status-indicator'

// Feedback
export { HoloModal } from './components/feedback/modal'
export { HoloConfirm } from './components/feedback/confirm'
export { HoloDrawer } from './components/feedback/drawer'
export { HoloAlert } from './components/feedback/alert'
export { HoloProgress } from './components/feedback/progress'
export { HoloSkeleton } from './components/feedback/skeleton'
export { HoloSpinner } from './components/feedback/spinner'
export { HexagonLoader } from './components/feedback/hexagon-loader'
export { ToastProvider, useToast } from './components/feedback/toast'

// AI
export { MessageBubble } from './components/ai/message-bubble'
export { MessageList } from './components/ai/message-list'
export { ChatInputArea } from './components/ai/chat-input'
export { ChatContainer } from './components/ai/chat-container'
export { HtmlPreviewBlock } from './components/ai/html-preview'
export { ToolExecutionCard } from './components/ai/tool-execution-card'
export { DataStreamEffect } from './components/ai/data-stream-effect'
export { CodeBlock } from './components/ai/code-block'

// Preset
export { presetSiliconHolo } from './preset'
