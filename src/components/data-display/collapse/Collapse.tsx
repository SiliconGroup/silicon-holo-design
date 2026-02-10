import { useState, type ReactNode } from 'react'

interface CollapseItem {
  key: string
  title: ReactNode
  content: ReactNode
  disabled?: boolean
}

interface HoloCollapseProps {
  items: CollapseItem[]
  activeKeys?: string[]
  onChange?: (keys: string[]) => void
  accordion?: boolean
  className?: string
}

export function HoloCollapse({
  items,
  activeKeys: controlledActiveKeys,
  onChange,
  accordion = false,
  className = '',
}: HoloCollapseProps) {
  const [internalActiveKeys, setInternalActiveKeys] = useState<string[]>([])
  const activeKeys = controlledActiveKeys ?? internalActiveKeys

  const handleToggle = (key: string) => {
    let newActiveKeys: string[]
    
    if (accordion) {
      newActiveKeys = activeKeys.includes(key) ? [] : [key]
    } else {
      newActiveKeys = activeKeys.includes(key)
        ? activeKeys.filter(k => k !== key)
        : [...activeKeys, key]
    }

    if (!controlledActiveKeys) {
      setInternalActiveKeys(newActiveKeys)
    }
    onChange?.(newActiveKeys)
  }

  return (
    <div className={className}>
      {items.map((item) => {
        const isActive = activeKeys.includes(item.key)
        
        return (
          <div key={item.key} className="border-b border-holo-cyan/10 last:border-b-0">
            <div
              className={`
                px-4 py-3 flex items-center justify-between cursor-pointer
                hover:bg-holo-cyan/5 text-sm text-white/80 transition-colors duration-200
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !item.disabled && handleToggle(item.key)}
            >
              <div>{item.title}</div>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {isActive && (
              <div className="px-4 py-3 border-t border-holo-cyan/10 text-sm text-white/60">
                {item.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}