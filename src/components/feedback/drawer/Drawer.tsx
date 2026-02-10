import { useEffect, type ReactNode } from 'react'
import { HoloPortal } from '@/utils/portal'

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
}: HoloDrawerProps) {
  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && maskClosable) onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose, maskClosable])

  if (!open) return null

  const slideClass = placement === 'left' 
    ? 'left-0 animate-[slideInLeft_200ms_ease-out]' 
    : 'right-0 animate-[slideInRight_200ms_ease-out]'

  return (
    <HoloPortal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50">
        <div className="fixed inset-0" onClick={maskClosable ? onClose : undefined} />
        <div
          className={`
            fixed top-0 bottom-0 bg-scene-deep/95 border-holo-cyan/20 backdrop-blur z-50
            ${width} ${slideClass} ${className}
          `}
        >
          <div className="flex items-center justify-between p-4 border-b border-holo-cyan/15">
            {title && (
              <h2 className="text-lg font-semibold bg-gradient-to-r from-holo-cyan to-white bg-clip-text text-transparent">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className={`border-none text-white/40 hover:text-white/80 transition-colors duration-200 ${closable ? '' : 'hidden'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </HoloPortal>
  )
}