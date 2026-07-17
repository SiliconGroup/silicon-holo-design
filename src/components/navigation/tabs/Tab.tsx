import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react'

interface HoloTabItem {
  key: string
  label: ReactNode
  icon?: ReactNode
  panelId?: string
}

interface HoloTabProps {
  items: HoloTabItem[]
  activeKey: string
  onChange: (key: string) => void
  className?: string
}

export function HoloTab({ items, activeKey, onChange, className = '' }: HoloTabProps) {
  const groupId = useId()
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!direction && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + direction + items.length) % items.length
    const next = items[nextIndex]
    onChange(next.key)
    buttonRefs.current[nextIndex]?.focus()
  }

  return (
    <div role="tablist" aria-orientation="horizontal" className={`flex items-center gap-1 ${className}`}>
      {items.map((item, index) => {
        const active = item.key === activeKey
        return (
          <button
            ref={element => { buttonRefs.current[index] = element }}
            type="button"
            role="tab"
            id={`${groupId}-${item.key}`}
            aria-selected={active}
            aria-controls={item.panelId}
            tabIndex={active ? 0 : -1}
            key={item.key}
            onClick={() => onChange(item.key)}
            onKeyDown={event => handleKeyDown(event, index)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium
              border transition-colors duration-150
              shd-control-focus
              ${active
                ? 'border-stroke-accent bg-surface-selected text-content-accent'
                : 'border-transparent bg-transparent text-content-tertiary hover:text-content-primary hover:bg-surface-interactive'
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
