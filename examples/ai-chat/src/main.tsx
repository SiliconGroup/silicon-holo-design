import 'virtual:uno.css'
import { createRoot } from 'react-dom/client'
import { useState, useCallback } from 'react'
import {
  LocaleProvider, enUS, zhCN, ToastProvider,
  AIChatContainer, AIToolExecutionCard, StatusIndicator, DataStreamEffect,
  HoloButton, HoloSpace, HoloDivider,
} from '../../../src'
import type { ChatMessage, Locale, ConnectionStatus, ToolStatus } from '../../../src'

const MOCK_REPLIES: Record<string, string> = {
  hello: 'Hello! I\'m a holographic AI assistant. How can I help you today?',
  help: 'I can help with:\n- **Code generation** — write functions, components, etc.\n- **Explanation** — break down complex concepts\n- **Analysis** — review and optimize your code\n\nJust ask me anything!',
}

let msgId = 0
const id = () => `msg-${++msgId}`

function App() {
  const [locale, setLocale] = useState<Locale>(enUS)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [processing, setProcessing] = useState(false)
  const [streaming, setStreaming] = useState('')
  const [thinking, setThinking] = useState('')
  const [status, setStatus] = useState<ConnectionStatus>('connected')
  const [toolDemo, setToolDemo] = useState<{ name: string; status: ToolStatus; result?: string } | null>(null)

  const handleSend = useCallback((text: string) => {
    const userMsg: ChatMessage = { id: id(), role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setProcessing(true)
    setStreaming('')
    setThinking('')

    // If user types "tool", simulate a tool call flow
    if (text.toLowerCase().trim() === 'tool') {
      setToolDemo({ name: 'search_codebase', status: 'running' })
      setTimeout(() => {
        setToolDemo({ name: 'search_codebase', status: 'complete', result: 'Found 3 matching files' })
        setMessages(prev => [...prev, {
          id: id(), role: 'tool', content: '', toolName: 'search_codebase',
          toolCallId: 'call-1', toolResult: 'Found 3 matching files', timestamp: new Date().toISOString(),
        }])
      }, 1500)
      setTimeout(() => {
        setToolDemo(null)
        const reply = 'I searched the codebase and found **3 matching files**. Here\'s a summary:\n\n```ts\n// src/utils/search.ts\nexport function search(query: string) { ... }\n```'
        streamReply(reply)
      }, 2500)
      return
    }

    const reply = MOCK_REPLIES[text.toLowerCase().trim()] ??
      `You said: *"${text}"*\n\nThis is a mock response demonstrating **Markdown** rendering with \`inline code\` and:\n\n\`\`\`ts\nconst greeting = "Hello from Silicon Holo!";\nconsole.log(greeting);\n\`\``

    streamReply(reply)
  }, [])

  function streamReply(reply: string) {
    // Phase 1: Simulate thinking (1.2s with incremental thinking text)
    const thinkingSteps = ['Analyzing request...', 'Analyzing request...\nSearching knowledge base...', 'Analyzing request...\nSearching knowledge base...\nFormulating response...']
    let step = 0
    const thinkInterval = setInterval(() => {
      if (step < thinkingSteps.length) {
        setThinking(thinkingSteps[step++])
      } else {
        clearInterval(thinkInterval)
        setThinking('')
        // Phase 2: Stream the reply
        let i = 0
        const interval = setInterval(() => {
          i += Math.floor(Math.random() * 3) + 1
          if (i >= reply.length) {
            clearInterval(interval)
            setStreaming('')
            setMessages(prev => [...prev, { id: id(), role: 'assistant', content: reply, timestamp: new Date().toISOString() }])
            setProcessing(false)
          } else {
            setStreaming(reply.slice(0, i))
          }
        }, 20)
      }
    }, 400)
  }

  return (
    <LocaleProvider locale={locale}>
      <ToastProvider>
        <div style={{ background: '#000a0e', height: '100vh', display: 'flex', flexDirection: 'column', color: 'rgba(255,255,255,0.9)' }}>
          {/* Header */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(0,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <img src="/logo.svg" alt="logo" style={{ height: 28 }} />
            <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(0,255,255,0.85)' }}>AI Chat Demo</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <StatusIndicator status={status} />
              <HoloSpace size="sm">
                <HoloButton size="sm" variant={locale === enUS ? 'primary' : 'ghost'} onClick={() => setLocale(enUS)}>EN</HoloButton>
                <HoloButton size="sm" variant={locale === zhCN ? 'primary' : 'ghost'} onClick={() => setLocale(zhCN)}>中文</HoloButton>
              </HoloSpace>
            </div>
          </div>

          {/* Chat area */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <DataStreamEffect active={processing} />
            <AIChatContainer
              messages={messages}
              onSend={handleSend}
              processing={processing}
              streamingContent={streaming}
              streamingThinking={thinking}
              showEmptyState={messages.length === 0 && !processing}
            />
          </div>

          {/* Tool execution card demo */}
          {toolDemo && (
            <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(0,255,255,0.08)', flexShrink: 0 }}>
              <AIToolExecutionCard toolName={toolDemo.name} status={toolDemo.status} result={toolDemo.result} />
            </div>
          )}

          {/* Status bar */}
          <div style={{ padding: '6px 24px', borderTop: '1px solid rgba(0,255,255,0.08)', fontSize: 11, color: 'rgba(255,255,255,0.25)', display: 'flex', gap: 16, flexShrink: 0 }}>
            <span>{messages.length} messages</span>
            <span>Type &quot;tool&quot; to see ToolExecutionCard demo</span>
            <span onClick={() => setStatus(s => s === 'connected' ? 'disconnected' : 'connected')} style={{ cursor: 'pointer' }}>
              Toggle status: {status}
            </span>
          </div>
        </div>
      </ToastProvider>
    </LocaleProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
