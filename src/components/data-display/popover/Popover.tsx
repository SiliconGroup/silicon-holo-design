import { cloneElement, isValidElement, useId, useState, useRef, useEffect, type FocusEvent, type MouseEvent as ReactMouseEvent, type ReactElement, type ReactNode } from 'react'
import { HoloPortal } from '@/utils/portal'
import { focusFirstOrContainer, trapFocus } from '@/utils/focus'

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
  const [positionVersion, setPositionVersion] = useState(0)
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
      } else if (isOpen && trigger === 'click' && panelRef.current) {
        trapFocus(event, panelRef.current)
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

  useEffect(() => {
    if (!isOpen) return
    const update = () => setPositionVersion(version => version + 1)
    const frame = requestAnimationFrame(update)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    if (trigger === 'click') queueMicrotask(() => panelRef.current && focusFirstOrContainer(panelRef.current))
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      cancelAnimationFrame(frame)
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
    void positionVersion
    if (!triggerRef.current) return {}
    const rect = triggerRef.current.getBoundingClientRect()
    const panelWidth = panelRef.current?.offsetWidth ?? 280
    const panelHeight = panelRef.current?.offsetHeight ?? 160
    const gap = 8
    const edge = 8
    const canFitTop = rect.top >= panelHeight + gap + edge
    const canFitBottom = window.innerHeight - rect.bottom >= panelHeight + gap + edge
    const canFitLeft = rect.left >= panelWidth + gap + edge
    const canFitRight = window.innerWidth - rect.right >= panelWidth + gap + edge
    const resolvedPlacement = placement === 'top' && !canFitTop && canFitBottom ? 'bottom'
      : placement === 'bottom' && !canFitBottom && canFitTop ? 'top'
        : placement === 'left' && !canFitLeft && canFitRight ? 'right'
          : placement === 'right' && !canFitRight && canFitLeft ? 'left'
            : placement
    const styles: React.CSSProperties = { position: 'fixed' }

    switch (resolvedPlacement) {
      case 'top':
        styles.top = Math.max(edge, rect.top - panelHeight - gap)
        styles.left = Math.min(window.innerWidth - panelWidth - edge, Math.max(edge, rect.left + rect.width / 2 - panelWidth / 2))
        break
      case 'bottom':
        styles.top = Math.min(window.innerHeight - panelHeight - edge, Math.max(edge, rect.bottom + gap))
        styles.left = Math.min(window.innerWidth - panelWidth - edge, Math.max(edge, rect.left + rect.width / 2 - panelWidth / 2))
        break
      case 'left':
        styles.left = Math.max(edge, rect.left - panelWidth - gap)
        styles.top = Math.min(window.innerHeight - panelHeight - edge, Math.max(edge, rect.top + rect.height / 2 - panelHeight / 2))
        break
      case 'right':
        styles.left = Math.min(window.innerWidth - panelWidth - edge, Math.max(edge, rect.right + gap))
        styles.top = Math.min(window.innerHeight - panelHeight - edge, Math.max(edge, rect.top + rect.height / 2 - panelHeight / 2))
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
            tabIndex={-1}
            aria-labelledby={triggerLabelId}
            style={getPositionStyles()}
            onMouseEnter={handleTriggerMouseEnter}
            onMouseLeave={handleTriggerMouseLeave}
            onFocusCapture={handleFocus}
            onBlurCapture={handleBlur}
            className={`
              shd-spectral-glass border border-stroke-default text-content-primary
              shd-z-nested-overlay shd-scrollbar box-border max-h-[calc(100vh-16px)] max-w-[calc(100vw-16px)] overflow-auto rounded-md p-3 shadow-[0_16px_40px_rgba(0,0,0,0.32)]
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
