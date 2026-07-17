import { cloneElement, isValidElement, useEffect, useId, useRef, useState, type FocusEvent, type ReactElement, type ReactNode } from 'react'
import { HoloPortal } from '@/utils/portal'

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
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [positionVersion, setPositionVersion] = useState(0)
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

  useEffect(() => {
    if (!visible) return
    const update = () => setPositionVersion(version => version + 1)
    const frame = requestAnimationFrame(update)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      cancelAnimationFrame(frame)
    }
  }, [visible])

  const getPositionStyles = () => {
    void positionVersion
    const rect = wrapperRef.current?.getBoundingClientRect()
    if (!rect) return {}
    const width = tooltipRef.current?.offsetWidth ?? 160
    const height = tooltipRef.current?.offsetHeight ?? 32
    const edge = 8
    const gap = 8
    const fits = {
      top: rect.top >= height + gap + edge,
      bottom: window.innerHeight - rect.bottom >= height + gap + edge,
      left: rect.left >= width + gap + edge,
      right: window.innerWidth - rect.right >= width + gap + edge,
    }
    const resolved = fits[placement] ? placement : placement === 'top' ? 'bottom' : placement === 'bottom' ? 'top' : placement === 'left' ? 'right' : 'left'
    if (resolved === 'top' || resolved === 'bottom') return {
      position: 'fixed' as const,
      top: resolved === 'top' ? Math.max(edge, rect.top - height - gap) : Math.min(window.innerHeight - height - edge, rect.bottom + gap),
      left: Math.min(window.innerWidth - width - edge, Math.max(edge, rect.left + rect.width / 2 - width / 2)),
    }
    return {
      position: 'fixed' as const,
      left: resolved === 'left' ? Math.max(edge, rect.left - width - gap) : Math.min(window.innerWidth - width - edge, rect.right + gap),
      top: Math.min(window.innerHeight - height - edge, Math.max(edge, rect.top + rect.height / 2 - height / 2)),
    }
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
      {visible && <HoloPortal>
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={`
            box-border z-40 max-h-[calc(100vh-16px)] max-w-[calc(100vw-16px)] overflow-auto px-2 py-1 text-xs text-content-primary whitespace-normal break-words
            shd-spectral-glass border border-stroke-default rounded shadow-[0_8px_24px_rgba(0,0,0,0.28)]
            ${className}
          `}
          style={getPositionStyles()}
        >
          {content}
        </div>
      </HoloPortal>}
    </div>
  )
}
