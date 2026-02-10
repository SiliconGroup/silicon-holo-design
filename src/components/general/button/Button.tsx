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
}

export function HoloButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  disabled = false,
}: HoloButtonProps) {
  const sizeClasses = {
    sm: 'py-2 px-3 text-xs gap-1.5',
    md: 'py-2.5 px-4 text-sm gap-2',
    lg: 'py-3 px-5 text-base gap-2',
  }

  // 全息风格：默认透明背景+发光边框，hover 时低透明度填充
  const variantClasses = {
    primary: `
      text-holo-cyan bg-transparent
      border-holo-cyan/60 hover:bg-holo-cyan/12 hover:border-holo-cyan
    `,
    secondary: `
      text-holo-cyan/70 bg-transparent
      border-holo-cyan/25 hover:bg-holo-cyan/8 hover:border-holo-cyan/50 hover:text-holo-cyan
    `,
    ghost: `
      text-white/60 bg-transparent border-transparent
      hover:text-holo-cyan hover:bg-holo-cyan/8
    `,
    success: `
      text-status-success bg-transparent
      border-status-success/60 hover:bg-status-success/12 hover:border-status-success
    `,
    warning: `
      text-status-warning bg-transparent
      border-status-warning/60 hover:bg-status-warning/12 hover:border-status-warning
    `,
    danger: `
      text-status-error bg-transparent
      border-status-error/60 hover:bg-status-error/12 hover:border-status-error
    `,
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded font-medium tracking-wide
        flex items-center justify-center border
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0 inline-flex">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}
