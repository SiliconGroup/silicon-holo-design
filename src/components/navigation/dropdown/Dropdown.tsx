import { cloneElement, isValidElement, useState, useRef, useEffect, useId, type FocusEvent, type MouseEvent as ReactMouseEvent, type ReactElement, type ReactNode } from 'react'
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
  const [positionVersion, setPositionVersion] = useState(0)
  const menuId = useId()
  const triggerLabelId = useId()
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const validItems = items.filter(item => !item.disabled && !item.divider)

  const focusTrigger = () => {
    triggerRef.current?.querySelector<HTMLElement>('[tabindex], button, a, input, select, textarea')?.focus()
  }

  useEffect(() => {
    if (!open) return

    panelRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setActiveIndex(-1)
        focusTrigger()
      } else if (e.key === 'ArrowDown') {
        if (validItems.length === 0) return
        e.preventDefault()
        setActiveIndex(prev => (prev + 1) % validItems.length)
      } else if (e.key === 'ArrowUp') {
        if (validItems.length === 0) return
        e.preventDefault()
        setActiveIndex(prev => prev <= 0 ? validItems.length - 1 : prev - 1)
      } else if ((e.key === 'Enter' || e.key === ' ') && activeIndex >= 0) {
        e.preventDefault()
        const item = validItems[activeIndex]
        onSelect?.(item.key)
        setOpen(false)
        setActiveIndex(-1)
        focusTrigger()
      } else if (e.key === 'Tab') {
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
    const updatePosition = () => setPositionVersion(version => version + 1)
    const frame = requestAnimationFrame(updatePosition)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      cancelAnimationFrame(frame)
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
    focusTrigger()
  }

  const isWithinDropdown = (target: EventTarget | null) => target instanceof Node && (
    triggerRef.current?.contains(target) || panelRef.current?.contains(target)
  )

  const handleFocus = () => {
    if (trigger === 'hover') setOpen(true)
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (trigger === 'hover' && !isWithinDropdown(event.relatedTarget)) {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  const handleMouseLeave = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (trigger === 'hover' && !isWithinDropdown(event.relatedTarget)) {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  const triggerContent = isValidElement(children)
    ? cloneElement(children as ReactElement<{
        'aria-controls'?: string
        'aria-expanded'?: boolean
        'aria-haspopup'?: 'menu'
      }>, {
        'aria-controls': menuId,
        'aria-expanded': open,
        'aria-haspopup': 'menu',
      })
    : children

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={triggerRef}
        id={triggerLabelId}
        onClick={handleTrigger}
        onMouseEnter={trigger === 'hover' ? () => setOpen(true) : undefined}
        onMouseLeave={handleMouseLeave}
        onFocusCapture={handleFocus}
        onBlurCapture={handleBlur}
      >
        {triggerContent}
      </div>
      
      {open && (
        <HoloPortal>
          <div
            ref={panelRef}
            id={menuId}
            role="menu"
            aria-labelledby={triggerLabelId}
            tabIndex={-1}
            aria-activedescendant={activeIndex >= 0 ? `${menuId}-item-${validItems[activeIndex]?.key}` : undefined}
            onMouseEnter={trigger === 'hover' ? () => setOpen(true) : undefined}
            onMouseLeave={handleMouseLeave}
            onFocusCapture={handleFocus}
            onBlurCapture={handleBlur}
            className={`
              shd-spectral-glass fixed border border-stroke-default
              shd-z-nested-overlay box-border max-h-[calc(100vh-16px)] max-w-[calc(100vw-16px)] overflow-auto rounded-md p-1 min-w-32 shadow-[0_16px_40px_rgba(0,0,0,0.32)]
            `}
            style={(() => {
              void positionVersion
              const rect = triggerRef.current?.getBoundingClientRect()
              if (!rect) return {}
              const panelWidth = panelRef.current?.offsetWidth ?? 160
              const panelHeight = panelRef.current?.offsetHeight ?? Math.min(240, items.length * 40 + 8)
              const edge = 8
              const gap = 4
              const top = window.innerHeight - rect.bottom >= panelHeight + gap + edge
                ? rect.bottom + gap
                : Math.max(edge, rect.top - panelHeight - gap)
              const preferredLeft = placement === 'bottomLeft' ? rect.left : rect.right - panelWidth
              return {
                top,
                left: Math.min(window.innerWidth - panelWidth - edge, Math.max(edge, preferredLeft)),
              }
            })()}
          >
            {items.map((item) => {
              if (item.divider) {
                return <div key={item.key} className="border-t border-stroke-muted my-1" />
              }
              
              const isActive = activeIndex === validItems.indexOf(item)
              
              return (
                <div
                  key={item.key}
                  id={`${menuId}-item-${item.key}`}
                  role="menuitem"
                  aria-disabled={item.disabled || undefined}
                  onClick={item.disabled ? undefined : () => handleSelect(item.key)}
                  className={`
                    px-3 py-2 text-sm flex items-center gap-2 rounded transition-colors duration-150
                    ${item.disabled 
                      ? 'text-content-disabled cursor-not-allowed'
                      : item.danger
                        ? 'text-status-error hover:bg-state-error-soft cursor-pointer'
                        : 'text-content-secondary hover:text-content-primary hover:bg-surface-interactive-hover cursor-pointer'
                    }
                    ${isActive ? 'bg-surface-selected text-content-accent' : ''}
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
