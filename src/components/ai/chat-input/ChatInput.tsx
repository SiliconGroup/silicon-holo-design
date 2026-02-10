import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { IconButton } from '@/components/general/icon-button'
import { useLocale } from '@/locale'

interface ChatInputAreaProps { onSend: (message: string) => void; disabled?: boolean }

export function ChatInputArea({ onSend, disabled = false }: ChatInputAreaProps) {
  const locale = useLocale()
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = !disabled && !!input.trim()

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const next = Math.min(el.scrollHeight, 180)
    el.style.height = `${next}px`
    el.style.overflowY = el.scrollHeight > 180 ? 'auto' : 'hidden'
  }, [input])

  const handleSubmit = () => { if (!canSend) return; onSend(input.trim()); setInput('') }
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }

  return (
    <div className={`relative rounded-lg border border-solid transition-all duration-300 backdrop-blur-md bg-clip-padding ${focused ? 'border-holo-cyan/50 bg-scene-deep/60' : 'border-holo-cyan/35 bg-scene-deep/40 hover:border-holo-cyan/45'}`}
      style={{ boxShadow: focused ? '0 0 20px rgba(0,255,255,0.06), inset 0 1px 0 rgba(0,255,255,0.08)' : '0 0 10px rgba(0,255,255,0.02)' }}>
      <div className={`absolute top-0 left-4 right-4 h-px transition-opacity duration-300 ${focused ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.3), transparent)' }} />
      <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} disabled={disabled}
        placeholder={locale.ai.inputPlaceholder} rows={1} aria-label={locale.ai.inputAriaLabel}
        className="chat-input-scrollbar w-full bg-transparent resize-none outline-none border-none overflow-hidden text-white/90 placeholder-white/25 font-sans text-[15px] leading-relaxed px-4 pt-3 pb-10 disabled:opacity-50 disabled:cursor-not-allowed" />
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 pb-2">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${focused ? 'bg-holo-cyan/60' : 'bg-white/15'}`} />
          <span className="text-[11px] text-white/20 select-none">{locale.ai.shiftEnterHint}</span>
        </div>
        <IconButton onClick={handleSubmit} disabled={!canSend} variant={canSend ? 'glow' : 'ghost'} size="sm" title={locale.ai.sendButton}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12h12m0 0l-5-5m5 5l-5 5" /></svg>
        </IconButton>
      </div>
    </div>
  )
}
