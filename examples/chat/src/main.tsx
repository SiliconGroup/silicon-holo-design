import 'virtual:uno.css'
import { createRoot } from 'react-dom/client'
import { useState, useCallback } from 'react'
import {
  LocaleProvider, enUS, zhCN, ToastProvider,
  ChatBubble, ChatInputArea, ChatMessageList,
  HoloButton, HoloSpace,
} from '../../../src'
import type { Locale } from '../../../src'

interface SimpleMessage {
  id: string
  align: 'left' | 'right'
  content: string
  timestamp: string
}

let msgId = 0
const nextId = () => `msg-${++msgId}`

const AUTO_REPLIES = [
  'Got it, thanks!',
  'Interesting, tell me more.',
  'Sure, I can help with that.',
  'Let me think about it...',
  'That sounds great!',
]

function App() {
  const [locale, setLocale] = useState<Locale>(enUS)
  const [messages, setMessages] = useState<SimpleMessage[]>([])

  const handleSend = useCallback((text: string) => {
    const now = new Date().toISOString()
    setMessages(prev => [...prev, { id: nextId(), align: 'right', content: text, timestamp: now }])

    // Simulate a reply after a short delay
    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
      setMessages(prev => [...prev, { id: nextId(), align: 'left', content: reply, timestamp: new Date().toISOString() }])
    }, 800)
  }, [])

  return (
    <LocaleProvider locale={locale}>
      <ToastProvider>
        <div style={{ background: '#000a0e', height: '100vh', display: 'flex', flexDirection: 'column', color: 'rgba(255,255,255,0.9)' }}>
          {/* Header */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(0,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(0,255,255,0.85)' }}>Chat Demo</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Using ChatBubble + ChatInputArea + ChatMessageList</span>
            <div style={{ marginLeft: 'auto' }}>
              <HoloSpace size="sm">
                <HoloButton size="sm" variant={locale === enUS ? 'primary' : 'ghost'} onClick={() => setLocale(enUS)}>EN</HoloButton>
                <HoloButton size="sm" variant={locale === zhCN ? 'primary' : 'ghost'} onClick={() => setLocale(zhCN)}>中文</HoloButton>
              </HoloSpace>
            </div>
          </div>

          {/* Message list */}
          <ChatMessageList
            scrollDeps={[messages]}
            isEmpty={messages.length === 0}
            emptyContent={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)' }}>Send a message to start chatting</p>
              </div>
            }
          >
            {messages.map(msg => (
              <ChatBubble key={msg.id} align={msg.align} timestamp={new Date(msg.timestamp).toLocaleTimeString()}>
                <p style={{ margin: 0 }}>{msg.content}</p>
              </ChatBubble>
            ))}
          </ChatMessageList>

          {/* Input */}
          <div style={{ padding: '8px 24px 20px', flexShrink: 0 }}>
            <ChatInputArea onSend={handleSend} />
          </div>
        </div>
      </ToastProvider>
    </LocaleProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
