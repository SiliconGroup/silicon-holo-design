import type { ReactNode } from 'react'

interface HoloLinkProps {
  href: string
  children: ReactNode
  external?: boolean
  disabled?: boolean
  className?: string
}

export function HoloLink({
  href,
  children,
  external = false,
  disabled = false,
  className = '',
}: HoloLinkProps) {
  const linkProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <a
      href={disabled ? undefined : href}
      className={`
        text-content-accent hover:text-accent-primary-hover
        border-b border-stroke-accent hover:border-stroke-accent-strong
        transition-colors duration-150 rounded-sm
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus
        ${disabled ? 'text-content-disabled border-stroke-muted pointer-events-none' : ''}
        ${className}
      `}
      {...(disabled ? {} : linkProps)}
    >
      {children}
    </a>
  )
}
