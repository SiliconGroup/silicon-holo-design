import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale } from '@/locale'

interface CopyActionProps {
  content?: string
  onCopy?: () => void | Promise<void>
  label?: string
  className?: string
}

export function CopyAction({ content, onCopy, label, className = '' }: CopyActionProps) {
  const locale = useLocale()
  const [copied, setCopied] = useState(false)
  const resetTimerRef = useRef<number>()
  const copyLabel = label ?? locale.ai.copy

  useEffect(() => () => window.clearTimeout(resetTimerRef.current), [])

  const handleCopy = useCallback(async () => {
    try {
      if (onCopy) await onCopy()
      else if (content !== undefined) await navigator.clipboard.writeText(content)
      window.clearTimeout(resetTimerRef.current)
      setCopied(true)
      resetTimerRef.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }, [content, onCopy])

  return (
    <button
      type="button"
      data-shd-copy-action="true"
      onClick={handleCopy}
      aria-label={copied ? locale.ai.copied : copyLabel}
      title={copied ? locale.ai.copied : copyLabel}
      className={`shd-copy-action shd-control-focus ${className}`}
    >
      {copied ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      )}
    </button>
  )
}
