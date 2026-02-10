import { type ReactNode } from 'react'

interface HoloSpaceProps {
  direction?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg' | number
  wrap?: boolean
  align?: 'start' | 'center' | 'end'
  children: ReactNode
  className?: string
}

export function HoloSpace({
  direction = 'horizontal',
  size = 'md',
  wrap = false,
  align,
  children,
  className = '',
}: HoloSpaceProps) {
  const sizeMap = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  }

  const gapClass = typeof size === 'number' ? '' : sizeMap[size]
  const gapStyle = typeof size === 'number' ? { gap: `${size}px` } : undefined

  const alignClass = align ? `items-${align}` : ''
  const directionClass = direction === 'vertical' ? 'flex-col' : 'flex-row'
  const wrapClass = wrap ? 'flex-wrap' : ''

  return (
    <div
      className={`flex ${directionClass} ${gapClass} ${alignClass} ${wrapClass} ${className}`}
      style={gapStyle}
    >
      {children}
    </div>
  )
}