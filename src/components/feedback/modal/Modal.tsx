import { useEffect, useRef, type ReactNode } from 'react'
import { HoloPortal } from '@/utils/portal'

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
}: HoloModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && maskClosable) onClose()
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return

      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0] as HTMLElement
      const last = focusable[focusable.length - 1] as HTMLElement

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTab)

    // Focus first focusable element
    setTimeout(() => {
      const first = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      first?.focus()
    }, 0)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
    }
  }, [open, closable, onClose])

  if (!open) return null

  return (
    <HoloPortal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0"
          onClick={maskClosable ? onClose : undefined}
        />
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          className={`
            relative bg-scene-deep/95 border border-holo-cyan/25 backdrop-blur rounded-lg z-50
            w-full ${width} animate-[fadeInScale_200ms_ease-out] ${className}
          `}
        >
          {(title || closable) && (
            <div className="flex items-center justify-between p-4 border-b border-holo-cyan/15">
              {title && (
                <h2 className="text-lg font-semibold bg-gradient-to-r from-holo-cyan to-white bg-clip-text text-transparent">
                  {title}
                </h2>
              )}
              {closable && (
                <button
                  onClick={onClose}
                  className="border-none text-white/40 hover:text-white/80 transition-colors"
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
            <div className="p-4 border-t border-holo-cyan/15">{footer}</div>
          )}
        </div>
      </div>
    </HoloPortal>
  )
}