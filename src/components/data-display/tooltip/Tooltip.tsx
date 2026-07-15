import { cloneElement, isValidElement, useId, useRef, useState, type FocusEvent, type ReactElement, type ReactNode } from 'react'

interface HoloTooltipProps {
  content: ReactNode
  children: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export function HoloTooltip({
  content,
  children,
  placement = 'top',
  delay = 200,
  className = '',
}: HoloTooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const tooltipId = useId()

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(true), delay)
  }

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current)
    setVisible(false)
  }

  const handleFocus = () => {
    clearTimeout(timeoutRef.current)
    setVisible(true)
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget instanceof Node && wrapperRef.current?.contains(event.relatedTarget)) return
    clearTimeout(timeoutRef.current)
    setVisible(false)
  }

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, {
        'aria-describedby': visible
          ? [children.props['aria-describedby'], tooltipId].filter(Boolean).join(' ')
          : children.props['aria-describedby'],
      })
    : children

  const placementClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      ref={wrapperRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
    >
      {trigger}
      {visible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`
            absolute z-40 px-2 py-1 text-xs text-content-primary whitespace-nowrap
            bg-surface-overlay-soft backdrop-blur-md border border-stroke-default rounded shadow-[0_8px_24px_rgba(0,0,0,0.28)]
            ${placementClasses[placement]} ${className}
          `}
        >
          {content}
        </div>
      )}
    </div>
  )
}
