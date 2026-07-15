import 'virtual:uno.css'
import '../../../src/styles/base.css'
import '../../../src/styles/animations.css'
import { createRoot } from 'react-dom/client'
import { useState, useCallback } from 'react'
import {
  LocaleProvider, enUS, zhCN, ToastProvider,
  AIChatContainer, AIToolExecutionCard, StatusIndicator, DataStreamEffect,
  HoloButton, HoloSpace, HoloTag,
} from '../../../src'
import type { ChatMessage, Locale, ConnectionStatus, ToolStatus } from '../../../src'

const MOCK_REPLIES: Record<string, string> = {
  hello: 'Hello! I am the spectral interface assistant. The visual system now uses deep-space surfaces and local optical response instead of heavy glass panels.',
  help: 'I can demonstrate:\n- **Streaming responses**\n- **Grouped tool execution**\n- **Markdown and code**\n- **Artifact-ready output**\n\nType `tool` to run the tool sequence.',
}

let messageId = 0
const id = () => `msg-${++messageId}`

function App() {
  const [locale, setLocale] = useState<Locale>(enUS)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [processing, setProcessing] = useState(false)
  const [streaming, setStreaming] = useState('')
  const [thinking, setThinking] = useState('')
  const [status, setStatus] = useState<ConnectionStatus>('connected')
  const [toolDemo, setToolDemo] = useState<{ name: string; status: ToolStatus; result?: string } | null>(null)
  const [staticMotion, setStaticMotion] = useState(false)

  const streamReply = useCallback((reply: string) => {
    const thinkingSteps = ['Mapping request context…', 'Evaluating component states…', 'Preparing response…']
    let thinkingIndex = 0
    const thinkingTimer = setInterval(() => {
      if (thinkingIndex < thinkingSteps.length) {
        setThinking(thinkingSteps[thinkingIndex++])
        return
      }
      clearInterval(thinkingTimer)
      setThinking('')
      let cursor = 0
      const streamingTimer = setInterval(() => {
        cursor += 2
        if (cursor >= reply.length) {
          clearInterval(streamingTimer)
          setStreaming('')
          setMessages(previous => [...previous, { id: id(), role: 'assistant', content: reply, timestamp: new Date().toISOString() }])
          setProcessing(false)
          return
        }
        setStreaming(reply.slice(0, cursor))
      }, 18)
    }, 380)
  }, [])

  const handleSend = useCallback((text: string) => {
    setMessages(previous => [...previous, { id: id(), role: 'user', content: text, timestamp: new Date().toISOString() }])
    setProcessing(true)
    setStreaming('')
    setThinking('')

    if (text.toLowerCase().trim() === 'tool') {
      setToolDemo({ name: 'inspect_design_system', status: 'running' })
      const toolMessages: ChatMessage[] = Array.from({ length: 12 }, (_, index) => ({
        id: id(),
        role: 'tool',
        content: '',
        toolName: ['scan_component', 'inspect_token', 'validate_state', 'render_preview'][index % 4] + `_${index + 1}`,
        toolStatus: 'complete',
        toolArguments: index === 4
          ? JSON.stringify({ workspace: '/Users/example/Dev/silicon-holo-design', constraints: Array.from({ length: 14 }, (_, item) => `compatibility-rule-${item + 1}`), viewport: '320px' }, null, 2)
          : JSON.stringify({ index, scope: index % 2 === 0 ? 'src/components' : 'semantic-tokens' }),
        toolResult: JSON.stringify({ valid: true, issues: 0, surface: index % 3 === 0 ? 'raised' : 'base' }),
        toolDuration: 120 + index * 31,
        timestamp: new Date().toISOString(),
      }))
      setTimeout(() => {
        setMessages(previous => [...previous, ...toolMessages])
        setToolDemo({ name: 'inspect_design_system', status: 'complete', result: 'Component, token, and preview checks completed.' })
      }, 1000)
      setTimeout(() => {
        setToolDemo(null)
        streamReply('The inspection completed successfully. The interface now uses **low-fill deep surfaces**, **local spectral edges**, and a compact tool audit trail.\n\n```ts\nconst visualLanguage = "spectral-flat";\n```')
      }, 1750)
      return
    }

    const reply = MOCK_REPLIES[text.toLowerCase().trim()] ?? `You said: *"${text}"*\n\nThis mock response demonstrates the upgraded streaming, Markdown, and code presentation.\n\n\`\`\`ts\nconst theme = { surface: 'deep-space', edge: 'spectral' };\n\`\`\``
    streamReply(reply)
  }, [streamReply])

  return (
    <LocaleProvider locale={locale}>
      <ToastProvider>
        <div className="relative h-screen flex flex-col overflow-hidden bg-surface-canvas text-content-primary">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(rgba(0,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.016) 1px, transparent 1px), radial-gradient(circle at 18% 0%, rgba(0,136,255,0.09), transparent 38%), radial-gradient(circle at 82% 100%, rgba(170,136,255,0.045), transparent 34%)',
            backgroundSize: '32px 32px, 32px 32px, auto, auto',
          }} />

          <header className="relative flex items-center gap-4 px-6 py-3 border-b border-stroke-subtle bg-surface-base">
            <img src="/logo.svg" alt="logo" className="h-7" />
            <div>
              <h1 className="m-0 text-base font-semibold text-content-primary">Spectral AI Console</h1>
              <p className="m-0 mt-0.5 text-[11px] text-content-tertiary">Streaming · tool audit · artifact preview</p>
            </div>
            <StatusIndicator status={status} />
            {processing && <HoloTag size="sm" color="purple">processing</HoloTag>}
            <div className="ml-auto flex items-center gap-3">
              <HoloSpace size="sm">
                <HoloButton size="sm" variant="ghost" onClick={() => setStaticMotion(current => !current)}>{staticMotion ? 'Motion' : 'Static'}</HoloButton>
                <HoloButton size="sm" variant={locale === enUS ? 'primary' : 'ghost'} onClick={() => setLocale(enUS)}>EN</HoloButton>
                <HoloButton size="sm" variant={locale === zhCN ? 'primary' : 'ghost'} onClick={() => setLocale(zhCN)}>中文</HoloButton>
              </HoloSpace>
            </div>
          </header>

          <main className="relative flex-1 overflow-hidden min-h-0 flex flex-col w-full max-w-6xl mx-auto">
            <DataStreamEffect active={processing && !staticMotion} className="opacity-55" />
            {processing && staticMotion && <div aria-hidden="true" className="absolute inset-x-[12%] top-1/2 h-24 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,var(--shd-accent-primary-soft),transparent_68%)] opacity-40 pointer-events-none" />}
            <AIChatContainer messages={messages} onSend={handleSend} processing={processing} streamingContent={streaming} streamingThinking={thinking} showEmptyState={messages.length === 0 && !processing} />
          </main>

          {toolDemo && (
            <div className="relative px-6 py-3 border-t border-stroke-muted bg-surface-base flex-shrink-0">
              <div className="max-w-6xl mx-auto"><AIToolExecutionCard toolName={toolDemo.name} status={toolDemo.status} result={toolDemo.result} /></div>
            </div>
          )}

          <footer className="relative px-6 py-2 border-t border-stroke-muted bg-surface-base text-[11px] text-content-tertiary flex gap-5 flex-shrink-0">
            <span className="font-mono">{messages.length.toString().padStart(2, '0')} messages</span>
            <span>Type <strong className="text-content-accent font-mono">tool</strong> for a 12-step group with a long 320px-safe payload</span>
            <button onClick={() => setStatus(current => current === 'connected' ? 'disconnected' : 'connected')} className="ml-auto border-none text-content-tertiary hover:text-content-accent">toggle link · {status}</button>
          </footer>
        </div>
      </ToastProvider>
    </LocaleProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
