import type { ReactNode } from 'react'

interface HoloButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  fullWidth?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function HoloButton({ children, onClick, className = '', variant = 'primary', size = 'md', icon, fullWidth = false, disabled = false, type = 'button' }: HoloButtonProps) {
  const sizeClasses = {
    sm: 'py-2 px-3 text-xs gap-1.5',
    md: 'py-2.5 px-4 text-sm gap-2',
    lg: 'py-3 px-5 text-base gap-2',
  }

  const variantClasses = {
    primary: 'text-content-accent bg-accent-primary-soft border-stroke-accent hover:bg-surface-selected hover:border-stroke-accent-strong active:bg-accent-primary-softer',
    secondary: 'text-content-secondary bg-surface-interactive border-stroke-default hover:bg-surface-interactive-hover hover:border-stroke-strong hover:text-content-primary active:bg-surface-selected',
    ghost: 'text-content-secondary bg-transparent border-transparent hover:text-content-primary hover:bg-surface-interactive active:bg-surface-selected',
    success: 'text-status-success bg-state-success-soft border-stroke-success hover:bg-[color-mix(in_srgb,var(--shd-status-success)_16%,transparent)] hover:border-[color-mix(in_srgb,var(--shd-status-success)_58%,transparent)] active:bg-[color-mix(in_srgb,var(--shd-status-success)_21%,transparent)]',
    warning: 'text-status-warning bg-state-warning-soft border-stroke-warning hover:bg-[color-mix(in_srgb,var(--shd-status-warning)_16%,transparent)] hover:border-[color-mix(in_srgb,var(--shd-status-warning)_62%,transparent)] active:bg-[color-mix(in_srgb,var(--shd-status-warning)_21%,transparent)]',
    danger: 'text-status-error bg-state-error-soft border-stroke-error hover:bg-[color-mix(in_srgb,var(--shd-status-error)_16%,transparent)] hover:border-[color-mix(in_srgb,var(--shd-status-error)_72%,transparent)] active:bg-[color-mix(in_srgb,var(--shd-status-error)_21%,transparent)]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`shd-control-focus rounded-sm font-medium tracking-wide flex items-center justify-center border transition-colors duration-150 focus-visible:border-stroke-strong disabled:text-content-disabled disabled:bg-transparent disabled:border-stroke-muted disabled:cursor-not-allowed ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="flex-shrink-0 inline-flex">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}
