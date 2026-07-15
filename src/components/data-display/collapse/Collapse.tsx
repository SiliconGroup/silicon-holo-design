import { useId, useState, type ReactNode } from 'react'

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
  const baseId = useId()
  const [internalActiveKeys, setInternalActiveKeys] = useState<string[]>([])
  const activeKeys = controlledActiveKeys ?? internalActiveKeys

  const handleToggle = (key: string) => {
    const newActiveKeys = accordion
      ? activeKeys.includes(key) ? [] : [key]
      : activeKeys.includes(key) ? activeKeys.filter(activeKey => activeKey !== key) : [...activeKeys, key]

    if (!controlledActiveKeys) setInternalActiveKeys(newActiveKeys)
    onChange?.(newActiveKeys)
  }

  return (
    <div data-shd-collapse="true" className={`shd-spectral-panel overflow-hidden rounded-md border border-stroke-subtle ${className}`}>
      {items.map((item) => {
        const isActive = activeKeys.includes(item.key)
        const regionId = `${baseId}-${item.key}`

        return (
          <div key={item.key} className="border-b border-stroke-muted last:border-b-0">
            <button
              type="button"
              aria-expanded={isActive}
              aria-controls={regionId}
              disabled={item.disabled}
              className={`
                border-none shd-local-focus w-full px-4 py-3 flex items-center justify-between text-left
                text-sm text-content-secondary transition-colors duration-150
                hover:bg-surface-interactive hover:text-content-primary
                disabled:text-content-disabled disabled:cursor-not-allowed
                ${isActive ? 'shd-local-active text-content-primary' : ''}
              `}
              onClick={() => handleToggle(item.key)}
            >
              <span>{item.title}</span>
              <svg
                className={`w-4 h-4 text-content-tertiary transition-transform duration-150 ${isActive ? 'rotate-90 text-content-accent' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {isActive && (
              <div id={regionId} role="region" className="px-4 py-3 border-t border-stroke-muted text-sm text-content-secondary bg-surface-base">
                {item.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
