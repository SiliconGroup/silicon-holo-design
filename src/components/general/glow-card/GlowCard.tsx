import type { ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'intense'
  hoverEffect?: boolean
  onClick?: () => void
}

export function GlowCard({
  children,
  className = '',
  variant = 'default',
  hoverEffect = true,
  onClick,
}: GlowCardProps) {
  const variants = {
    default: `
      bg-scene-deep/70 border-holo-cyan/15
    `,
    elevated: `
      bg-scene-deep/80 border-holo-cyan/25
    `,
    intense: `
      bg-scene-surface/80 border-holo-cyan/35
    `,
  }

  return (
    <div
      className={`
        relative overflow-hidden backdrop-blur-sm border rounded-md
        transition-all duration-250
        ${variants[variant]}
        ${hoverEffect ? 'hover:border-holo-cyan/35' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}
