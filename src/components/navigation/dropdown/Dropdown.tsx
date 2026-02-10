import { useState, useRef, useEffect, type ReactNode } from 'react'
import { HoloPortal } from '@/utils/portal'

interface DropdownItem {
  key: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
  danger?: boolean
  divider?: boolean
}

interface HoloDropdownProps {
  items: DropdownItem[]
  trigger?: 'click' | 'hover'
  children: ReactNode
  onSelect?: (key: string) => void
  placement?: 'bottomLeft' | 'bottomRight'
  className?: string
}

export function HoloDropdown({
  items,
  trigger = 'click',
  children,
  onSelect,
  placement = 'bottomLeft',
  className = '',
}: HoloDropdownProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const validItems = items.filter(item => !item.disabled && !item.divider)
      
      if (e.key === 'Escape') {
        setOpen(false)
        setActiveIndex(-1)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(prev => (prev + 1) % validItems.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(prev => prev <= 0 ? validItems.length - 1 : prev - 1)
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault()
        const item = validItems[activeIndex]
        onSelect?.(item.key)
        setOpen(false)
        setActiveIndex(-1)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node) && 
          !panelRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, activeIndex, items, onSelect])

  const handleTrigger = () => {
    if (trigger === 'click') {
      setOpen(!open)
    }
  }

  const handleSelect = (key: string) => {
    onSelect?.(key)
    setOpen(false)
    setActiveIndex(-1)
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={triggerRef}
        onClick={handleTrigger}
        onMouseEnter={trigger === 'hover' ? () => setOpen(true) : undefined}
        onMouseLeave={trigger === 'hover' ? () => setOpen(false) : undefined}
      >
        {children}
      </div>
      
      {open && (
        <HoloPortal>
          <div
            ref={panelRef}
            className={`
              fixed bg-scene-void/95 backdrop-blur-sm border border-holo-cyan/25 
              rounded-md py-1 z-30 min-w-32
            `}
            style={(() => {
              const rect = triggerRef.current?.getBoundingClientRect()
              if (!rect) return {}
              return {
                top: rect.bottom + 4,
                left: placement === 'bottomLeft' ? rect.left : undefined,
                right: placement === 'bottomRight' ? window.innerWidth - rect.right : undefined,
              }
            })()}
          >
            {items.map((item) => {
              if (item.divider) {
                return <div key={item.key} className="border-t border-holo-cyan/10 my-1" />
              }
              
              const isActive = activeIndex === items.filter(i => !i.disabled && !i.divider).indexOf(item)
              
              return (
                <div
                  key={item.key}
                  onClick={item.disabled ? undefined : () => handleSelect(item.key)}
                  className={`
                    px-3 py-2 text-sm flex items-center gap-2 transition-colors duration-200
                    ${item.disabled 
                      ? 'text-white/30 cursor-not-allowed' 
                      : item.danger
                        ? 'text-status-error hover:bg-status-error/8 cursor-pointer'
                        : 'text-white/80 hover:bg-holo-cyan/8 cursor-pointer'
                    }
                    ${isActive ? 'bg-holo-cyan/8' : ''}
                  `}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
              )
            })}
          </div>
        </HoloPortal>
      )}
    </div>
  )
}