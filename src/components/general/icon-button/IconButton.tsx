import type { ReactNode } from 'react'

interface IconButtonProps {
  children: ReactNode
  onClick?: (e: React.MouseEvent) => void
  className?: string
  variant?: 'default' | 'ghost' | 'glow' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  title?: string
}

const sizeClasses = {
  sm: 'p-1.5 w-7 h-7',
  md: 'p-2 w-9 h-9',
  lg: 'p-2.5 w-11 h-11',
}

export function IconButton({
  children,
  onClick,
  className = '',
  variant = 'default',
  size = 'md',
  disabled,
  title,
}: IconButtonProps) {
  const variantClasses = {
    default: `
      text-white/50 hover:text-holo-cyan
      bg-transparent hover:bg-holo-cyan/8
      border border-holo-cyan/30 hover:border-holo-cyan/50
    `,
    ghost: `
      text-white/40 hover:text-holo-cyan
      bg-transparent hover:bg-white/5
      border border-holo-cyan/30 hover:border-holo-cyan/50
    `,
    glow: `
      text-holo-cyan/80 hover:text-holo-cyan
      bg-holo-cyan/8 hover:bg-holo-cyan/12
      border border-holo-cyan/50 hover:border-holo-cyan/70
    `,
    danger: `
      text-white/40 hover:text-status-error
      bg-transparent hover:bg-status-error/8
      border border-status-error/30 hover:border-status-error/50
    `,
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        flex-center rounded
        transition-colors duration-200
        disabled:opacity-30 disabled:pointer-events-none
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
