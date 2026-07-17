import 'virtual:uno.css'
import '../../../src/styles/base.css'
import '../../../src/styles/animations.css'
import { createRoot } from 'react-dom/client'
import { useState, useCallback } from 'react'
import {
  LocaleProvider, enUS, zhCN, ToastProvider,
  AIChatContainer, AIToolExecutionCard, AITaskExecutionPanel, ArtifactPreviewDrawer, StatusIndicator, DataStreamEffect,
  HoloButton, HoloSpace, HoloTag,
} from '../../../src'
import type { Artifact, ChatMessage, Locale, ConnectionStatus, ToolStatus } from '../../../src'

const SAMPLE_ARTIFACT: Artifact = {
  id: 'ai-chat-preview',
  type: 'html',
  title: 'Spectral Interface Report',
  content: '<!doctype html><html><body style="margin:0;background:#000a0f;color:#eaffff;font-family:system-ui;padding:32px"><section style="border:1px solid #1a6570;background:#001219;padding:24px"><strong style="color:#65e2ee">AUDIT COMPLETE</strong><p>Semantic surfaces, tool execution, and compatibility gates passed.</p></section></body></html>',
}

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
  const [taskDemo, setTaskDemo] = useState<{
    description: string
    tasks: { id: string; description: string; completed: boolean }[]
  } | null>(null)
  const [staticMotion, setStaticMotion] = useState(false)
  const [artifactOpen, setArtifactOpen] = useState(false)

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
      setTaskDemo({
        description: 'Validate spectral-flat release',
        tasks: [
          { id: 'scan', description: 'Scan component surfaces', completed: true },
          { id: 'focus', description: 'Verify focus and selected states', completed: false },
          { id: 'preview', description: 'Render showcase previews', completed: false },
        ],
      })
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
        setTaskDemo(previous => previous ? { ...previous, tasks: previous.tasks.map(task => ({ ...task, completed: true })) } : null)
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
            background: 'linear-gradient(rgba(0,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.016) 1px, transparent 1px), radial-gradient(circle at 18% 0%, rgba(0,230,190,0.09), transparent 38%), radial-gradient(circle at 82% 100%, rgba(80,220,170,0.045), transparent 34%)',
            backgroundSize: '32px 32px, 32px 32px, auto, auto',
          }} />

          <header className="shd-spectral-panel-raised relative flex flex-wrap items-center gap-3 border-b border-stroke-subtle px-4 py-3 sm:gap-4 sm:px-6">
            <img src="/logo.svg" alt="logo" className="h-7" />
            <div className="min-w-0 flex-1 sm:flex-none">
              <h1 className="m-0 text-base font-semibold text-content-primary">Spectral AI Console</h1>
              <p className="m-0 mt-0.5 text-[11px] text-content-tertiary">Streaming · tool audit · artifact preview</p>
            </div>
            <StatusIndicator status={status} />
            {processing && <HoloTag size="sm" color="purple">processing</HoloTag>}
            <div className="w-full sm:ml-auto sm:w-auto">
              <HoloSpace size="sm" wrap>
                <HoloButton size="sm" variant="ghost" onClick={() => setStaticMotion(current => !current)}>{staticMotion ? 'Motion' : 'Static'}</HoloButton>
                <HoloButton size="sm" variant="ghost" onClick={() => setArtifactOpen(true)}>Artifact</HoloButton>
                <HoloButton size="sm" variant={locale === enUS ? 'primary' : 'ghost'} onClick={() => setLocale(enUS)}>EN</HoloButton>
                <HoloButton size="sm" variant={locale === zhCN ? 'primary' : 'ghost'} onClick={() => setLocale(zhCN)}>中文</HoloButton>
              </HoloSpace>
            </div>
          </header>

          {taskDemo && (
            <div className="relative flex-shrink-0 px-6 pt-3">
              <div className="mx-auto max-w-6xl">
                <AITaskExecutionPanel taskList={taskDemo} headerMeta="4 updates" />
              </div>
            </div>
          )}

          <main className="relative flex-1 overflow-hidden min-h-0 flex flex-col w-full max-w-6xl mx-auto">
            <DataStreamEffect active={processing && !staticMotion} className="opacity-55" />
            {processing && staticMotion && <div aria-hidden="true" className="absolute inset-x-[12%] top-1/2 h-24 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,var(--shd-accent-primary-soft),transparent_68%)] opacity-40 pointer-events-none" />}
            <AIChatContainer messages={messages} onSend={handleSend} processing={processing} streamingContent={streaming} streamingThinking={thinking} showEmptyState={messages.length === 0 && !processing} />
          </main>

          {toolDemo && (
            <div className="relative px-6 py-3 border-t border-stroke-muted bg-surface-base-soft flex-shrink-0">
              <div className="max-w-6xl mx-auto"><AIToolExecutionCard toolName={toolDemo.name} status={toolDemo.status} result={toolDemo.result} /></div>
            </div>
          )}

          <footer className="relative px-6 py-2 border-t border-stroke-muted bg-surface-base text-[11px] text-content-tertiary flex gap-5 flex-shrink-0">
            <span className="font-mono">{messages.length.toString().padStart(2, '0')} messages</span>
            <span>Type <strong className="text-content-accent font-mono">tool</strong> for a 12-step group with a long 320px-safe payload</span>
            <button onClick={() => setStatus(current => current === 'connected' ? 'disconnected' : 'connected')} className="shd-control-focus ml-auto border-none bg-transparent text-content-tertiary hover:text-content-accent">toggle link · {status}</button>
          </footer>
          <ArtifactPreviewDrawer artifact={artifactOpen ? SAMPLE_ARTIFACT : null} onClose={() => setArtifactOpen(false)} width="min(48rem, calc(100vw - 16px))" />
        </div>
      </ToastProvider>
    </LocaleProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
