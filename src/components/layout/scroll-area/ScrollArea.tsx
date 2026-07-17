import type { ReactNode } from 'react'

interface HoloScrollAreaProps {
  maxHeight?: string | number
  children: ReactNode
  className?: string
}

export function HoloScrollArea({ maxHeight, children, className = '' }: HoloScrollAreaProps) {
  const style = maxHeight ? { maxHeight } : undefined

  return (
    <div
      className={`shd-scrollbar overflow-y-auto ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
