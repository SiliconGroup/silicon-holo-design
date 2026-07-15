import type { ReactNode } from 'react'

interface HoloTabItem {
  key: string
  label: ReactNode
  icon?: ReactNode
}

interface HoloTabProps {
  items: HoloTabItem[]
  activeKey: string
  onChange: (key: string) => void
  className?: string
}

export function HoloTab({ items, activeKey, onChange, className = '' }: HoloTabProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {items.map((item) => {
        const active = item.key === activeKey
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium
              border transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus
              ${active
                ? 'border-stroke-accent bg-surface-selected text-content-accent'
                : 'border-transparent text-content-tertiary hover:text-content-primary hover:bg-surface-interactive'
              }
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
