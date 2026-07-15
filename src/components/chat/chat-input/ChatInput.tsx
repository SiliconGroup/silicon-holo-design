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
    const element = textareaRef.current
    if (!element) return
    element.style.height = 'auto'
    const nextHeight = Math.min(element.scrollHeight, 180)
    element.style.height = `${nextHeight}px`
    element.style.overflowY = element.scrollHeight > 180 ? 'auto' : 'hidden'
  }, [input])

  const handleSubmit = () => {
    if (!canSend) return
    onSend(input.trim())
    setInput('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={`relative rounded-md border bg-surface-overlay transition-colors duration-150 ${focused ? 'border-stroke-accent ring-2 ring-focus ring-offset-1 ring-offset-surface-base' : 'border-stroke-default hover:border-stroke-strong'}`}>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        placeholder={locale.chat.inputPlaceholder}
        rows={1}
        aria-label={locale.chat.inputAriaLabel}
        className="chat-input-scrollbar w-full bg-transparent resize-none outline-none border-none overflow-hidden text-content-primary placeholder-text-content-tertiary font-sans text-[15px] leading-relaxed px-4 pt-3 pb-10 disabled:text-content-disabled disabled:cursor-not-allowed"
      />
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 pb-2">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-1 rounded-full transition-colors duration-150 ${focused ? 'bg-accent-primary' : 'bg-stroke-strong'}`} />
          <span className="text-[11px] text-content-disabled select-none">{locale.chat.shiftEnterHint}</span>
        </div>
        <IconButton onClick={handleSubmit} disabled={!canSend} variant={canSend ? 'glow' : 'ghost'} size="sm" title={locale.chat.sendButton}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12h12m0 0l-5-5m5 5l-5 5" /></svg>
        </IconButton>
      </div>
    </div>
  )
}
