import type { ReactNode } from 'react'

interface IconButtonProps {
  children: ReactNode
  onClick?: (e: React.MouseEvent) => void
  className?: string
  variant?: 'default' | 'ghost' | 'glow' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  title?: string
  type?: 'button' | 'submit' | 'reset'
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
  type = 'button',
}: IconButtonProps) {
  const variantClasses = {
    default: `
      text-content-secondary hover:text-content-primary
      bg-surface-interactive hover:bg-surface-interactive-hover
      border border-stroke-default hover:border-stroke-strong
    `,
    ghost: `
      text-content-tertiary hover:text-content-primary
      bg-transparent hover:bg-surface-interactive border border-transparent
    `,
    glow: `
      text-content-accent hover:text-content-primary
      bg-accent-primary-soft hover:bg-surface-selected
      border border-stroke-accent hover:border-stroke-accent-strong
    `,
    danger: `
      text-content-tertiary hover:text-status-error
      bg-transparent hover:bg-state-error-soft
      border border-transparent hover:border-stroke-error
    `,
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        flex-center rounded
        transition-colors duration-150
        shd-control-focus focus-visible:border-stroke-strong
        disabled:text-content-disabled disabled:bg-transparent disabled:border-transparent disabled:pointer-events-none
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
