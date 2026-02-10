export type MessageRole = 'user' | 'assistant' | 'tool' | 'system'
export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp?: string
  toolName?: string
  toolCallId?: string
  toolResult?: string
}
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error'
export type ToolStatus = 'pending' | 'running' | 'complete' | 'error'
