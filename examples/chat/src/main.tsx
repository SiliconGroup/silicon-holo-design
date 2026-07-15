import 'virtual:uno.css'
import '../../../src/styles/base.css'
import '../../../src/styles/animations.css'
import { createRoot } from 'react-dom/client'
import { useState, useCallback } from 'react'
import {
  LocaleProvider, enUS, zhCN, ToastProvider,
  ChatBubble, ChatInputArea, ChatMessageList,
  HoloButton, HoloSpace, HoloTag,
} from '../../../src'
import type { Locale } from '../../../src'

interface SimpleMessage {
  id: string
  align: 'left' | 'right'
  content: string
  timestamp: string
  streaming?: boolean
}

let msgId = 2
const nextId = () => `msg-${++msgId}`
const initialMessages: SimpleMessage[] = [
  { id: 'msg-1', align: 'left', content: 'Spectral channel established. What would you like to explore?', timestamp: new Date().toISOString() },
  { id: 'msg-2', align: 'right', content: 'Show me a clean, reusable chat composition.', timestamp: new Date().toISOString() },
]

const AUTO_REPLIES = [
  'The composition stays intentionally small: message list, bubble shell, and composer. Business message models remain yours.',
  'The new surface system keeps the canvas dark while focus and streaming states carry the spectral response.',
  'You can theme the primitive cyan and blue tokens without changing the component API.',
]

function App() {
  const [locale, setLocale] = useState<Locale>(enUS)
  const [messages, setMessages] = useState<SimpleMessage[]>(initialMessages)
  const [replying, setReplying] = useState(false)

  const handleSend = useCallback((text: string) => {
    const now = new Date().toISOString()
    setMessages(previous => [...previous, { id: nextId(), align: 'right', content: text, timestamp: now }])
    setReplying(true)

    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
      setMessages(previous => [...previous, { id: nextId(), align: 'left', content: reply, timestamp: new Date().toISOString() }])
      setReplying(false)
    }, 850)
  }, [])

  return (
    <LocaleProvider locale={locale}>
      <ToastProvider>
        <div className="relative h-screen flex flex-col overflow-hidden bg-surface-canvas text-content-primary">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(rgba(0,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.018) 1px, transparent 1px), radial-gradient(circle at 22% 0%, rgba(0,136,255,0.08), transparent 38%)',
            backgroundSize: '32px 32px, 32px 32px, auto',
          }} />

          <header className="relative flex items-center gap-4 px-6 py-3 border-b border-stroke-subtle bg-surface-base">
            <div className="w-8 h-8 rounded flex-center border border-stroke-default bg-accent-primary-softer text-content-accent font-mono">S</div>
            <div>
              <h1 className="m-0 text-base font-semibold text-content-primary">Spectral Chat</h1>
              <p className="m-0 mt-0.5 text-[11px] text-content-tertiary">ChatBubble · ChatMessageList · ChatInputArea</p>
            </div>
            <HoloTag size="sm" color={replying ? 'purple' : 'green'}>{replying ? 'responding' : 'online'}</HoloTag>
            <div className="ml-auto">
              <HoloSpace size="sm">
                <HoloButton size="sm" variant={locale === enUS ? 'primary' : 'ghost'} onClick={() => setLocale(enUS)}>EN</HoloButton>
                <HoloButton size="sm" variant={locale === zhCN ? 'primary' : 'ghost'} onClick={() => setLocale(zhCN)}>中文</HoloButton>
              </HoloSpace>
            </div>
          </header>

          <main className="relative flex-1 min-h-0 w-full max-w-5xl mx-auto flex flex-col">
            <ChatMessageList scrollDeps={[messages, replying]} isEmpty={false}>
              {messages.map(message => (
                <ChatBubble key={message.id} align={message.align} timestamp={new Date(message.timestamp).toLocaleTimeString()}>
                  <p className="m-0 text-content-primary leading-relaxed">{message.content}</p>
                </ChatBubble>
              ))}
              {replying && (
                <ChatBubble align="left" streaming>
                  <div className="flex items-center gap-2 text-content-secondary text-sm"><span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />Composing response</div>
                </ChatBubble>
              )}
            </ChatMessageList>
            <div className="px-5 pb-5 pt-2 flex-shrink-0"><ChatInputArea onSend={handleSend} disabled={replying} /></div>
          </main>
        </div>
      </ToastProvider>
    </LocaleProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
