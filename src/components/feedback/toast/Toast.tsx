import { createContext, useCallback, useContext, useState, useEffect, type ReactNode } from 'react'
import { HoloPortal } from '@/utils/portal'

type ToastType = 'success' | 'error' | 'info'
interface ToastItem { id: string; type: ToastType; message: string }
interface ToastAPI { success: (msg: string) => void; error: (msg: string) => void; info: (msg: string) => void }

const ToastContext = createContext<ToastAPI | null>(null)

const icons: Record<ToastType, JSX.Element> = {
  success: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  error: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  info: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
}

const colors: Record<ToastType, { border: string; text: string; glow: string; bar: string }> = {
  success: { border: 'border-status-success/30', text: 'text-status-success', glow: 'bg-status-success shadow-[0_0_8px_#00ff88]', bar: 'from-status-success to-status-success/0' },
  error: { border: 'border-status-error/30', text: 'text-status-error', glow: 'bg-status-error shadow-[0_0_8px_#ff5566]', bar: 'from-status-error to-status-error/0' },
  info: { border: 'border-holo-cyan/30', text: 'text-holo-cyan', glow: 'bg-holo-cyan shadow-[0_0_8px_#00ffff]', bar: 'from-holo-cyan to-holo-cyan/0' },
}

function ToastItemView({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false)
  const color = colors[item.type]
  useEffect(() => { const t = setTimeout(() => setExiting(true), 2800); return () => clearTimeout(t) }, [])
  return (
    <div onClick={() => onDismiss(item.id)} className={`relative min-w-[280px] max-w-[360px] cursor-pointer overflow-hidden bg-scene-void/95 backdrop-blur-sm border rounded transition-all duration-200 ${color.border} ${exiting ? 'opacity-0 translate-x-4' : 'animate-[slideIn_200ms_ease-out]'}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${color.glow} animate-pulse`} />
      <div className="flex items-center gap-3 pl-4 pr-3 py-3">
        <span className={color.text}>{icons[item.type]}</span>
        <span className="flex-1 text-sm text-white/80">{item.message}</span>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${color.bar} animate-[shrink_3s_linear]`} />
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const dismiss = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), [])
  const show = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => dismiss(id), 3000)
  }, [dismiss])
  const api: ToastAPI = { success: (m) => show('success', m), error: (m) => show('error', m), info: (m) => show('info', m) }
  return (
    <ToastContext.Provider value={api}>
      {children}
      {toasts.length > 0 && (
        <HoloPortal>
          <div className="fixed top-16 right-4 z-50 flex flex-col gap-2">
            {toasts.map(t => <ToastItemView key={t.id} item={t} onDismiss={dismiss} />)}
          </div>
        </HoloPortal>
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
