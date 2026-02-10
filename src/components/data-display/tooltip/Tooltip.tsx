import { useState, useRef, type ReactNode } from 'react'

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

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(true), delay)
  }

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current)
    setVisible(false)
  }

  const placementClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {visible && (
        <div
          className={`
            absolute z-40 px-2 py-1 text-xs text-white/80 whitespace-nowrap
            bg-scene-void/95 backdrop-blur-sm border border-holo-cyan/25 rounded
            ${placementClasses[placement]} ${className}
          `}
        >
          {content}
        </div>
      )}
    </div>
  )
}