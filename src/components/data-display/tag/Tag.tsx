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
  cyan: { bg: 'bg-holo-cyan/10', border: 'border-holo-cyan/30', text: 'text-holo-cyan', hover: 'hover:bg-holo-cyan/20' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', hover: 'hover:bg-blue-500/20' },
  green: { bg: 'bg-status-success/10', border: 'border-status-success/30', text: 'text-status-success', hover: 'hover:bg-status-success/20' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', hover: 'hover:bg-purple-500/20' },
  error: { bg: 'bg-status-error/10', border: 'border-status-error/30', text: 'text-status-error', hover: 'hover:bg-status-error/20' },
  warning: { bg: 'bg-status-warning/10', border: 'border-status-warning/30', text: 'text-status-warning', hover: 'hover:bg-status-warning/20' },
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
          className={`border-none flex-shrink-0 rounded-full transition-colors ${colorConfig.hover}`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}