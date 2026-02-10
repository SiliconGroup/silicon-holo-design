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
    
    // Smooth scroll to anchor
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className={className}>
      {items.map((item) => {
        const isActive = activeKey === item.key
        
        return (
          <div
            key={item.key}
            className={`
              pl-3 py-1.5 text-sm cursor-pointer transition-colors duration-200
              border-l-2
              ${isActive
                ? 'text-holo-cyan border-l-holo-cyan'
                : 'text-white/50 hover:text-holo-cyan/70 border-l-transparent'
              }
            `}
            onClick={() => handleClick(item.key, item.href)}
          >
            {item.title}
          </div>
        )
      })}
    </div>
  )
}