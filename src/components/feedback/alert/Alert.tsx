import { type ReactNode } from 'react'

interface HoloAlertProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title?: ReactNode
  description?: ReactNode
  closable?: boolean
  onClose?: () => void
  icon?: ReactNode
  className?: string
}

const typeConfig = {
  info: {
    color: 'holo-cyan',
    bg: 'bg-holo-cyan/5',
    border: 'border-holo-cyan/20',
    bar: 'bg-holo-cyan shadow-[0_0_8px_#00ffff]',
    text: 'text-holo-cyan',
  },
  success: {
    color: 'status-success',
    bg: 'bg-status-success/5',
    border: 'border-status-success/20',
    bar: 'bg-status-success shadow-[0_0_8px_#00ff88]',
    text: 'text-status-success',
  },
  warning: {
    color: 'status-warning',
    bg: 'bg-status-warning/5',
    border: 'border-status-warning/20',
    bar: 'bg-status-warning shadow-[0_0_8px_#ffaa00]',
    text: 'text-status-warning',
  },
  error: {
    color: 'status-error',
    bg: 'bg-status-error/5',
    border: 'border-status-error/20',
    bar: 'bg-status-error shadow-[0_0_8px_#ff5566]',
    text: 'text-status-error',
  },
}

const defaultIcons = {
  info: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

export function HoloAlert({
  type,
  title,
  description,
  closable = false,
  onClose,
  icon,
  className = '',
}: HoloAlertProps) {
  const config = typeConfig[type]
  const displayIcon = icon ?? defaultIcons[type]

  return (
    <div className={`relative border rounded-lg ${config.bg} ${config.border} ${className}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg ${config.bar}`} />
      <div className="flex items-center gap-3 pl-4 pr-3 py-3">
        <span className={`flex-shrink-0 ${config.text}`}>{displayIcon}</span>
        <div className="flex-1 min-w-0">
          {title && (
            <div className={`font-medium ${config.text} mb-1`}>{title}</div>
          )}
          {description && (
            <div className="text-white/70 text-sm">{description}</div>
          )}
        </div>
        {closable && (
          <button
            onClick={onClose}
            className="border-none flex-shrink-0 text-white/40 hover:text-white/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}