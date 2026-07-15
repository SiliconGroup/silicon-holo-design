import { useMemo, Fragment } from 'react'
import type { ReactNode } from 'react'
import type { ChatMessage, Artifact, FileArtifact } from '@/types'
import { ChatMessageList } from '@/components/chat/chat-message-list'
import { AIMessageBubble } from '@/components/ai/message-bubble'
import { AIToolCallGroup } from '@/components/ai/tool-call-group'
import { HexagonLoader } from '@/components/feedback/hexagon-loader'
import { useLocale } from '@/locale'

interface AIMessageListProps {
  messages: ChatMessage[]
  streamingContent?: string
  streamingThinking?: string
  processing?: boolean
  emptyContent?: ReactNode
  onOpenArtifact?: (artifact: Artifact) => void
  /** 是否启用消息复制按钮 */
  enableCopy?: boolean
  /** 渲染工具组产出的文件卡片（在工具组之后、下一条消息之前） */
  renderFileGroup?: (artifacts: FileArtifact[], toolGroup: ChatMessage[]) => ReactNode
}

interface MessageItem {
  type: 'message'
  message: ChatMessage
}

interface ToolGroupItem {
  type: 'tool-group'
  messages: ChatMessage[]
}

type RenderItem = MessageItem | ToolGroupItem

function groupMessages(messages: ChatMessage[]): RenderItem[] {
  const items: RenderItem[] = []
  let i = 0

  while (i < messages.length) {
    const msg = messages[i]

    if (msg.role === 'tool' && msg.toolName) {
      const toolMessages: ChatMessage[] = [msg]
      i++
      while (i < messages.length && messages[i].role === 'tool' && messages[i].toolName) {
        toolMessages.push(messages[i])
        i++
      }
      items.push({ type: 'tool-group', messages: toolMessages })
    } else {
      items.push({ type: 'message', message: msg })
      i++
    }
  }

  return items
}

/** Extract file artifacts from a tool group's metadata */
function extractArtifactsFromGroup(messages: ChatMessage[]): FileArtifact[] {
  return messages.flatMap(msg => {
    if (!msg.toolMetadata) return []
    try {
      const meta = JSON.parse(msg.toolMetadata) as Record<string, unknown>
      const artifacts = meta.artifacts
      if (Array.isArray(artifacts)) return artifacts as FileArtifact[]
      return []
    } catch {
      return []
    }
  })
}

export function AIMessageList({ messages, streamingContent, streamingThinking, processing, emptyContent: customEmptyContent, onOpenArtifact, enableCopy, renderFileGroup }: AIMessageListProps) {
  const locale = useLocale()

  const defaultEmptyContent = (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="relative w-36 h-36 mb-4">
        <div className="absolute inset-0 rounded-full border border-stroke-muted" />
        <div className="absolute inset-4 rounded-full border border-stroke-subtle border-r-accent-purple-soft" />
        <div className="absolute inset-10 rounded-full border border-stroke-accent border-l-transparent" />
        <div className="absolute inset-0 flex-center">
          <svg className="w-16 h-16 text-content-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
      </div>
      <h2 className="text-xl font-medium text-content-primary mb-2">{locale.ai.newConversation}</h2>
      <p className="text-sm text-content-tertiary">{locale.ai.newConversationHint}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {[locale.ai.suggestCode, locale.ai.suggestExplain, locale.ai.suggestAnalyze].map((hint) => (
          <span key={hint} className="px-3 py-1.5 rounded-full text-xs text-content-secondary bg-surface-base border border-stroke-subtle">{hint}</span>
        ))}
      </div>
    </div>
  )

  const renderItems = useMemo(() => groupMessages(messages), [messages])

  return (
    <ChatMessageList scrollDeps={[messages, streamingContent, streamingThinking]} isEmpty={messages.length === 0 && !processing} emptyContent={customEmptyContent ?? defaultEmptyContent}>
      {renderItems.map((item) => {
        if (item.type === 'tool-group') {
          const key = item.messages[0].id
          const artifacts = extractArtifactsFromGroup(item.messages)
          return (
            <Fragment key={key}>
              <AIToolCallGroup messages={item.messages} />
              {artifacts.length > 0 && renderFileGroup?.(artifacts, item.messages)}
            </Fragment>
          )
        }
        return <AIMessageBubble key={item.message.id} message={item.message} onOpenArtifact={onOpenArtifact} enableCopy={enableCopy} />
      })}

      {streamingThinking && (
        <div className="flex justify-start my-4"><div className="shd-spectral-panel-raised max-w-[85%] px-5 py-4 border border-stroke-subtle rounded-md text-content-secondary text-sm whitespace-pre-wrap overflow-hidden"><span className="text-content-tertiary text-xs mr-2">◇</span>{streamingThinking}</div></div>
      )}

      {streamingContent && <AIMessageBubble message={{ id: 'streaming', role: 'assistant', content: streamingContent, timestamp: new Date().toISOString() }} isStreaming />}

      {processing && !streamingContent && (
        <div className="flex justify-start my-4"><div className="shd-spectral-panel-raised flex items-center gap-4 px-5 py-4 border border-stroke-subtle rounded-md overflow-hidden">
          <HexagonLoader size={28} /><div><p className="text-sm text-content-primary">{locale.ai.thinking}</p><p className="text-xs text-content-tertiary mt-0.5">{locale.ai.thinkingDescription}</p></div>
        </div></div>
      )}
    </ChatMessageList>
  )
}
