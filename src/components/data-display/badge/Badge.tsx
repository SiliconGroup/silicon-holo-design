import { type ReactNode } from 'react'

interface HoloBadgeProps {
  count?: number
  dot?: boolean
  color?: 'cyan' | 'green' | 'error' | 'warning'
  overflowCount?: number
  showZero?: boolean
  children: ReactNode
  className?: string
}

const colorMap = {
  cyan: 'bg-holo-cyan text-scene-void',
  green: 'bg-status-success text-scene-void',
  error: 'bg-status-error text-white',
  warning: 'bg-status-warning text-scene-void',
}

export function HoloBadge({
  count,
  dot = false,
  color = 'cyan',
  overflowCount = 99,
  showZero = false,
  children,
  className = '',
}: HoloBadgeProps) {
  const shouldShow = dot || (count !== undefined && (count > 0 || showZero))
  
  if (!shouldShow) return <>{children}</>

  const displayCount = count !== undefined && count > overflowCount ? `${overflowCount}+` : count

  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      <span
        className={`
          absolute top-0 right-0 translate-x-1/2 -translate-y-1/2
          flex items-center justify-center font-medium
          ${dot ? 'w-2 h-2' : 'min-w-5 h-5 px-1 text-xs'}
          rounded-full ${colorMap[color]}
        `}
      >
        {!dot && displayCount}
      </span>
    </div>
  )
}