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
    bg: 'bg-accent-primary-softer border-l-stroke-accent',
    border: 'border-stroke-subtle',
    text: 'text-content-accent',
  },
  success: {
    bg: 'bg-state-success-soft border-l-stroke-success',
    border: 'border-stroke-subtle',
    text: 'text-status-success',
  },
  warning: {
    bg: 'bg-state-warning-soft border-l-stroke-warning',
    border: 'border-stroke-subtle',
    text: 'text-status-warning',
  },
  error: {
    bg: 'bg-state-error-soft border-l-stroke-error',
    border: 'border-stroke-subtle',
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
    <div role={type === 'warning' || type === 'error' ? 'alert' : 'status'} className={`shd-spectral-panel border border-l-2 rounded-md ${config.bg} ${config.border} ${className}`}>
      <div className="flex items-center gap-3 px-3 py-3">
        <span className={`flex-shrink-0 ${config.text}`}>{displayIcon}</span>
        <div className="flex-1 min-w-0">
          {title && (
            <div className={`font-medium ${config.text} mb-1`}>{title}</div>
          )}
          {description && (
            <div className="text-content-secondary text-sm">{description}</div>
          )}
        </div>
        {closable && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close alert"
            className="shd-control-focus border-none bg-transparent flex-shrink-0 rounded p-1 text-content-tertiary hover:text-content-primary hover:bg-surface-interactive transition-colors"
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
