import { cloneElement, isValidElement, useId, useState, useRef, useEffect, type FocusEvent, type MouseEvent as ReactMouseEvent, type ReactElement, type ReactNode } from 'react'
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
  const panelId = useId()
  const triggerLabelId = useId()
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        triggerRef.current?.querySelector<HTMLElement>('[tabindex], button, a, input, select, textarea')?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    if (trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
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

  const isWithinPopover = (target: EventTarget | null) => target instanceof Node && (
    triggerRef.current?.contains(target) || panelRef.current?.contains(target)
  )

  const handleTriggerMouseLeave = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (trigger === 'hover' && !isWithinPopover(event.relatedTarget)) setOpen(false)
  }

  const handleFocus = () => {
    if (trigger === 'hover') setOpen(true)
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (trigger === 'hover' && !isWithinPopover(event.relatedTarget)) setOpen(false)
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

  const triggerContent = isValidElement(children)
    ? cloneElement(children as ReactElement<{
        'aria-controls'?: string
        'aria-expanded'?: boolean
        'aria-haspopup'?: 'dialog'
      }>, {
        'aria-controls': panelId,
        'aria-expanded': isOpen,
        'aria-haspopup': 'dialog',
      })
    : children

  return (
    <>
      <div
        ref={triggerRef}
        id={triggerLabelId}
        onClick={handleTriggerClick}
        onMouseEnter={handleTriggerMouseEnter}
        onMouseLeave={handleTriggerMouseLeave}
        onFocusCapture={handleFocus}
        onBlurCapture={handleBlur}
        className="inline-block"
      >
        {triggerContent}
      </div>
      {isOpen && (
        <HoloPortal>
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-labelledby={triggerLabelId}
            style={getPositionStyles()}
            onMouseEnter={handleTriggerMouseEnter}
            onMouseLeave={handleTriggerMouseLeave}
            onFocusCapture={handleFocus}
            onBlurCapture={handleBlur}
            className={`
              bg-surface-overlay-soft backdrop-blur-md border border-stroke-default
              rounded-md p-3 z-40 shadow-[0_16px_40px_rgba(0,0,0,0.32)]
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
