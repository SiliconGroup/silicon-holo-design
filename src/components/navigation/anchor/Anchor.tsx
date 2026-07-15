import type { ReactNode } from 'react'

interface AnchorItem {
  key: string
  title: ReactNode
  href: string
}

interface HoloAnchorProps {
  items: AnchorItem[]
  activeKey?: string
  onChange?: (key: string) => void
  className?: string
}

export function HoloAnchor({ items, activeKey, onChange, className = '' }: HoloAnchorProps) {
  const handleClick = (key: string, href: string) => {
    onChange?.(key)
    
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ block: 'start' })
    }
  }

  return (
    <div className={className}>
      {items.map((item) => {
        const isActive = activeKey === item.key
        
        return (
          <button
            type="button"
            key={item.key}
            className={`
              block w-full appearance-none bg-transparent pl-3 py-1.5 text-left text-sm cursor-pointer transition-colors duration-150
              border-y-0 border-r-0 border-l-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus
              ${isActive
                ? 'text-content-accent border-l-accent-primary bg-accent-primary-softer'
                : 'text-content-tertiary hover:text-content-primary border-l-transparent'
              }
            `}
            onClick={() => handleClick(item.key, item.href)}
          >
            {item.title}
          </button>
        )
      })}
    </div>
  )
}
