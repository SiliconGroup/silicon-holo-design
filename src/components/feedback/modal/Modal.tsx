import { useEffect, useId, useRef, type ReactNode } from 'react'
import { HoloPortal } from '@/utils/portal'
import { focusFirstOrContainer, restoreFocus, trapFocus } from '@/utils/focus'
import { useLocale } from '@/locale'

interface HoloModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  footer?: ReactNode
  width?: string
  closable?: boolean
  maskClosable?: boolean
  children: ReactNode
  className?: string
  ariaLabel?: string
}

export function HoloModal({
  open,
  onClose,
  title,
  footer,
  width = 'max-w-lg',
  closable = false,
  maskClosable = true,
  children,
  className = '',
  ariaLabel,
}: HoloModalProps) {
  const locale = useLocale()
  const titleId = useId()
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && maskClosable) onClose()
    }

    const handleTab = (e: KeyboardEvent) => {
      if (modalRef.current) trapFocus(e, modalRef.current)
    }

    const previousFocus = document.activeElement as HTMLElement | null
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTab)

    queueMicrotask(() => {
      if (modalRef.current) focusFirstOrContainer(modalRef.current)
    })

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
      restoreFocus(previousFocus)
    }
  }, [open, maskClosable, onClose])

  if (!open) return null

  return (
    <HoloPortal>
      <div className="fixed inset-0 bg-[var(--shd-overlay-scrim)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0"
          onClick={maskClosable ? onClose : undefined}
        />
        <div
          ref={modalRef}
          data-shd-motion="overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-label={title ? undefined : ariaLabel ?? 'Dialog'}
          tabIndex={-1}
          className={`
            relative bg-surface-overlay border border-stroke-subtle rounded-md z-50
            shadow-[0_24px_70px_rgba(0,0,0,0.42)]
            w-full ${width} animate-[fadeInScale_240ms_var(--shd-ease-standard)] ${className}
          `}
        >
          {(title || closable) && (
            <div className="flex items-center justify-between p-4 border-b border-stroke-subtle">
              {title && (
                <h2 id={titleId} className="text-lg font-semibold text-content-primary holo-title">
                  {title}
                </h2>
              )}
              {closable && (
                <button
                  onClick={onClose}
                  aria-label={locale.common.close}
                  className="border-none rounded p-1 text-content-tertiary hover:text-content-primary hover:bg-surface-interactive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className="p-4">{children}</div>
          {footer && (
            <div className="p-4 border-t border-stroke-subtle">{footer}</div>
          )}
        </div>
      </div>
    </HoloPortal>
  )
}
