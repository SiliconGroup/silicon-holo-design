import { useState, useRef, useEffect, type ReactNode } from 'react'
import { HoloPortal } from '@/utils/portal'

interface HoloPopoverProps {
  content: ReactNode
  children: ReactNode
  trigger?: 'click' | 'hover'
  placement?: 'top' | 'bottom' | 'left' | 'right'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function HoloPopover({
  content,
  children,
  trigger = 'click',
  placement = 'bottom',
  open: controlledOpen,
  onOpenChange,
  className = '',
}: HoloPopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const isControlled = controlledOpen !== undefined

  const isOpen = isControlled ? controlledOpen : internalOpen
  const setOpen = (open: boolean) => {
    if (isControlled) {
      onOpenChange?.(open)
    } else {
      setInternalOpen(open)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        triggerRef.current &&
        panelRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, trigger])

  const handleTriggerClick = () => {
    if (trigger === 'click') {
      setOpen(!isOpen)
    }
  }

  const handleTriggerMouseEnter = () => {
    if (trigger === 'hover') {
      setOpen(true)
    }
  }

  const handleTriggerMouseLeave = () => {
    if (trigger === 'hover') {
      setOpen(false)
    }
  }

  const getPositionStyles = () => {
    if (!triggerRef.current) return {}
    
    const rect = triggerRef.current.getBoundingClientRect()
    const styles: React.CSSProperties = { position: 'absolute' }

    switch (placement) {
      case 'top':
        styles.bottom = window.innerHeight - rect.top + 8
        styles.left = rect.left + rect.width / 2
        styles.transform = 'translateX(-50%)'
        break
      case 'bottom':
        styles.top = rect.bottom + 8
        styles.left = rect.left + rect.width / 2
        styles.transform = 'translateX(-50%)'
        break
      case 'left':
        styles.right = window.innerWidth - rect.left + 8
        styles.top = rect.top + rect.height / 2
        styles.transform = 'translateY(-50%)'
        break
      case 'right':
        styles.left = rect.right + 8
        styles.top = rect.top + rect.height / 2
        styles.transform = 'translateY(-50%)'
        break
    }

    return styles
  }

  return (
    <>
      <div
        ref={triggerRef}
        onClick={handleTriggerClick}
        onMouseEnter={handleTriggerMouseEnter}
        onMouseLeave={handleTriggerMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {isOpen && (
        <HoloPortal>
          <div
            ref={panelRef}
            style={getPositionStyles()}
            className={`
              bg-scene-void/95 backdrop-blur-sm border border-holo-cyan/25
              rounded-md p-3 z-40 shadow-lg
              ${className}
            `}
          >
            {content}
          </div>
        </HoloPortal>
      )}
    </>
  )
}