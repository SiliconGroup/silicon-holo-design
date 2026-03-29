export type MessageRole = 'user' | 'assistant' | 'tool' | 'system'
export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp?: string
  toolName?: string
  toolCallId?: string
  toolResult?: string
  /** 工具调用状态（仅 role=tool 时有意义） */
  toolStatus?: ToolStatus
  /** 工具调用参数（JSON 字符串） */
  toolArguments?: string
  /** 工具执行耗时（毫秒） */
  toolDuration?: number
}
export type ToolStatus = 'pending' | 'running' | 'complete' | 'error'

/** 可预览的内容类型，可扩展 */
export type ArtifactType = 'html' | 'image' | 'svg'

/** 通用 Artifact 描述 */
export interface Artifact {
  id: string
  type: ArtifactType
  title?: string
  content: string
  messageId?: string
}
