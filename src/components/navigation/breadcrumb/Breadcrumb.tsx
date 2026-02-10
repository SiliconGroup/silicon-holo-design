import type { ReactNode } from 'react'

interface BreadcrumbItem {
  label: ReactNode
  href?: string
  onClick?: () => void
}

interface HoloBreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: ReactNode
  className?: string
}

export function HoloBreadcrumb({
  items,
  separator = '/',
  className = '',
}: HoloBreadcrumbProps) {
  return (
    <nav className={`flex items-center ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center">
              {isLast ? (
                <span className="text-sm text-holo-cyan" aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  onClick={item.onClick}
                  className="text-sm cursor-pointer transition-colors duration-200 text-white/50 hover:text-holo-cyan/70"
                >
                  {item.label}
                </a>
              ) : (
                <button
                  onClick={item.onClick}
                  className="text-sm cursor-pointer transition-colors duration-200 text-white/50 hover:text-holo-cyan/70 border-none"
                >
                  {item.label}
                </button>
              )}
              {!isLast && (
                <span className="text-white/20 mx-2" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}