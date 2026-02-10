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
              border transition-colors duration-200
              ${active
                ? 'border-holo-cyan/40 bg-holo-cyan/10 text-holo-cyan'
                : 'border-transparent text-white/40 hover:text-holo-cyan/70 hover:bg-holo-cyan/5 hover:border-holo-cyan/20'
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
