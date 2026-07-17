import { useEffect, useId, useRef, type ReactNode } from 'react'
import { HoloPortal } from '@/utils/portal'
import { focusFirstOrContainer, restoreFocus, trapFocus } from '@/utils/focus'
import { useLocale } from '@/locale'
import { lockDocumentScroll } from '@/utils/scroll-lock'

interface HoloDrawerProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  placement?: 'left' | 'right'
  width?: string
  closable?: boolean
  maskClosable?: boolean
  children: ReactNode
  className?: string
  ariaLabel?: string
}

export function HoloDrawer({
  open,
  onClose,
  title,
  placement = 'right',
  width = 'w-80',
  closable = true,
  maskClosable = true,
  children,
  className = '',
  ariaLabel,
}: HoloDrawerProps) {
  const locale = useLocale()
  const titleId = useId()
  const drawerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && maskClosable) onClose()
    }

    const handleTab = (e: KeyboardEvent) => {
      if (drawerRef.current) trapFocus(e, drawerRef.current)
    }

    const previousFocus = document.activeElement as HTMLElement | null
    const unlockScroll = lockDocumentScroll()
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTab)
    queueMicrotask(() => {
      if (drawerRef.current) focusFirstOrContainer(drawerRef.current)
    })
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
      restoreFocus(previousFocus)
      unlockScroll()
    }
  }, [open, onClose, maskClosable])

  if (!open) return null

  const slideClass = placement === 'left' 
    ? 'left-0 animate-[slideInLeft_240ms_var(--shd-ease-standard)] border-r'
    : 'right-0 animate-[slideInRight_240ms_var(--shd-ease-standard)] border-l'

  return (
    <HoloPortal>
      <div className="fixed inset-0 bg-[var(--shd-overlay-scrim)] backdrop-blur-sm z-50">
        <div className="fixed inset-0" onClick={maskClosable ? onClose : undefined} />
        <div
          ref={drawerRef}
          data-shd-motion="overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-label={title ? undefined : ariaLabel ?? 'Drawer'}
          tabIndex={-1}
          className={`
            shd-spectral-glass fixed top-0 bottom-0 flex max-w-[calc(100vw-16px)] flex-col overflow-hidden border-stroke-default z-50 text-content-primary
            shadow-[0_0_60px_rgba(0,0,0,0.28)]
            ${width} ${slideClass} ${className}
          `}
        >
          <div className="flex items-center justify-between p-4 border-b border-stroke-subtle">
            {title && (
              <h2 id={titleId} className="text-lg font-semibold text-content-primary holo-title">
                {title}
              </h2>
            )}
            {closable && (
              <button
                type="button"
                onClick={onClose}
                aria-label={locale.common.close}
                className="shd-control-focus border-none bg-transparent rounded p-1 text-content-tertiary hover:text-content-primary hover:bg-surface-interactive transition-colors duration-150"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
        </div>
      </div>
    </HoloPortal>
  )
}
