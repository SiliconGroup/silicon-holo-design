import type { KeyboardEvent, ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'intense'
  hoverEffect?: boolean
  onClick?: () => void
}

export function GlowCard({ children, className = '', variant = 'default', hoverEffect = true, onClick }: GlowCardProps) {
  const variants = {
    default: 'bg-surface-base border-stroke-subtle',
    elevated: 'bg-surface-raised border-stroke-default',
    intense: 'bg-surface-raised border-stroke-strong',
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    onClick()
  }

  return (
    <div
      className={`relative overflow-hidden border rounded-md transition-colors duration-150 ${variants[variant]} ${hoverEffect ? 'hover:bg-surface-interactive hover:border-stroke-strong' : ''} ${onClick ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus' : ''} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}
