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
        text-holo-cyan hover:text-holo-cyan/80
        border-b border-holo-cyan/30 hover:border-holo-cyan
        transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-holo-cyan/50
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
        ${className}
      `}
      {...(disabled ? {} : linkProps)}
    >
      {children}
    </a>
  )
}