import { createContext, useCallback, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import { HoloPortal } from '@/utils/portal'
import { useLocale } from '@/locale'

type ToastType = 'success' | 'error' | 'info'
interface ToastItem { id: string; type: ToastType; message: string }
interface ToastAPI { success: (msg: string) => void; error: (msg: string) => void; info: (msg: string) => void }

const ToastContext = createContext<ToastAPI | null>(null)
let toastSequence = 0
const TOAST_DURATION = 8000

const icons: Record<ToastType, JSX.Element> = {
  success: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  error: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  info: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
}

const colors: Record<ToastType, { border: string; text: string; accent: string; bar: string }> = {
  success: { border: 'border-stroke-success', text: 'text-status-success', accent: 'bg-status-success', bar: 'from-status-success to-transparent' },
  error: { border: 'border-stroke-error', text: 'text-status-error', accent: 'bg-status-error', bar: 'from-status-error to-transparent' },
  info: { border: 'border-stroke-accent', text: 'text-content-accent', accent: 'bg-accent-primary', bar: 'from-accent-primary to-transparent' },
}

function ToastItemView({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const color = colors[item.type]
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const remainingRef = useRef(TOAST_DURATION)
  const startedAtRef = useRef(0)
  const pauseReasonsRef = useRef(new Set<'hover' | 'focus'>())
  const [paused, setPaused] = useState(false)

  const resume = useCallback(() => {
    clearTimeout(timerRef.current)
    startedAtRef.current = performance.now()
    timerRef.current = setTimeout(() => onDismiss(item.id), remainingRef.current)
    setPaused(false)
  }, [item.id, onDismiss])
  const pause = useCallback((reason: 'hover' | 'focus') => {
    if (pauseReasonsRef.current.has(reason)) return
    const wasRunning = pauseReasonsRef.current.size === 0
    pauseReasonsRef.current.add(reason)
    if (!wasRunning) return
    clearTimeout(timerRef.current)
    remainingRef.current = Math.max(0, remainingRef.current - (performance.now() - startedAtRef.current))
    setPaused(true)
  }, [])
  const resumeWhenClear = useCallback((reason: 'hover' | 'focus') => {
    pauseReasonsRef.current.delete(reason)
    if (pauseReasonsRef.current.size === 0) resume()
  }, [resume])

  useEffect(() => {
    resume()
    return () => clearTimeout(timerRef.current)
  }, [resume])

  return (
    <button
      data-shd-motion="overlay"
      type="button"
      onClick={() => onDismiss(item.id)}
      onMouseEnter={() => pause('hover')}
      onMouseLeave={() => resumeWhenClear('hover')}
      onFocus={() => pause('focus')}
      onBlur={() => resumeWhenClear('focus')}
      className={`shd-spectral-glass shd-control-focus relative w-[min(360px,calc(100vw-32px))] cursor-pointer overflow-hidden border rounded-md text-left shadow-[0_12px_32px_rgba(0,0,0,0.3)] transition-all duration-180 animate-[slideIn_180ms_var(--shd-ease-standard)] ${color.border}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${color.accent}`} />
      <div className="flex items-center gap-3 pl-4 pr-3 py-3">
        <span className={color.text}>{icons[item.type]}</span>
        <span className="min-w-0 flex-1 break-words text-sm text-content-primary [overflow-wrap:anywhere]">{item.message}</span>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${color.bar} animate-[shrink_8s_linear] ${paused ? '[animation-play-state:paused]' : ''}`} />
    </button>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const locale = useLocale()
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const dismiss = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), [])
  const show = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${++toastSequence}`
    setToasts(prev => [...prev, { id, type, message }])
  }, [])
  const api: ToastAPI = { success: (m) => show('success', m), error: (m) => show('error', m), info: (m) => show('info', m) }
  return (
    <ToastContext.Provider value={api}>
      {children}
      <HoloPortal>
        <div role="region" aria-label={locale.common.notifications ?? 'Notifications'} aria-live="polite" aria-relevant="additions text" className="fixed right-4 top-16 z-50 flex max-w-[calc(100vw-32px)] flex-col gap-2">
          {toasts.map(t => <ToastItemView key={t.id} item={t} onDismiss={dismiss} />)}
        </div>
      </HoloPortal>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
