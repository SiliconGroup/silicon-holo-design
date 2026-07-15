import { type ReactNode } from 'react'

interface HoloTagProps {
  children: ReactNode
  color?: 'cyan' | 'blue' | 'green' | 'purple' | 'error' | 'warning'
  closable?: boolean
  onClose?: () => void
  icon?: ReactNode
  size?: 'sm' | 'md'
  className?: string
}

const colorMap = {
  cyan: { bg: 'bg-accent-primary-soft', border: 'border-stroke-accent', text: 'text-content-accent', hover: 'hover:bg-surface-selected' },
  blue: { bg: 'bg-accent-blue-soft', border: 'border-stroke-subtle', text: 'text-accent-blue', hover: 'hover:bg-surface-interactive-hover' },
  green: { bg: 'bg-state-success-soft', border: 'border-stroke-success', text: 'text-status-success', hover: 'hover:bg-surface-interactive-hover' },
  purple: { bg: 'bg-accent-purple-soft', border: 'border-stroke-subtle', text: 'text-accent-purple', hover: 'hover:bg-surface-interactive-hover' },
  error: { bg: 'bg-state-error-soft', border: 'border-stroke-error', text: 'text-status-error', hover: 'hover:bg-surface-interactive-hover' },
  warning: { bg: 'bg-state-warning-soft', border: 'border-stroke-warning', text: 'text-status-warning', hover: 'hover:bg-surface-interactive-hover' },
}

const sizeMap = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
}

export function HoloTag({
  children,
  color = 'cyan',
  closable = false,
  onClose,
  icon,
  size = 'md',
  className = '',
}: HoloTagProps) {
  const colorConfig = colorMap[color]

  return (
    <span
      className={`
        inline-flex items-center rounded-full border
        ${sizeMap[size]} ${colorConfig.bg} ${colorConfig.border} ${colorConfig.text} ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {closable && (
        <button
          onClick={onClose}
          className={`border-none flex-shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${colorConfig.hover}`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}
