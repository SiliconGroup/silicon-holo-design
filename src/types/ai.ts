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
  /** 工具执行元数据（JSON 字符串，可含 artifacts 等结构化信息） */
  toolMetadata?: string
}
export type ToolStatus = 'pending' | 'running' | 'complete' | 'error'

/** 工具产出的文件描述 */
export interface FileArtifact {
  path: string
  mime_type?: string
  file_name?: string
}

/** 可预览的内容类型，支持扩展自定义类型 */
export type ArtifactType = 'html' | 'image' | 'svg' | (string & {})

/** Artifact 资源来源；保留 content 字段以兼容已有调用。 */
export type ArtifactSource =
  | { kind: 'text'; value: string }
  | { kind: 'url'; url: string }
  | { kind: 'blob'; blob: Blob }
  | { kind: 'arrayBuffer'; data: ArrayBuffer }

/** 通用 Artifact 描述 */
export interface Artifact {
  id: string
  type: ArtifactType
  title?: string
  content: string
  source?: ArtifactSource
  mimeType?: string
  fileName?: string
  messageId?: string
}
