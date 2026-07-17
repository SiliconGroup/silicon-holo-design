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
                <span className="text-sm text-content-primary" aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  onClick={item.onClick}
                  className="text-sm cursor-pointer transition-colors duration-150 text-content-tertiary hover:text-content-accent"
                >
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="shd-control-focus bg-transparent text-sm cursor-pointer transition-colors duration-150 text-content-tertiary hover:text-content-accent border-none rounded"
                >
                  {item.label}
                </button>
              )}
              {!isLast && (
                <span className="text-content-disabled mx-2" aria-hidden="true">
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
