import type { ReactNode } from 'react'

interface DescriptionItem {
  label: ReactNode
  value: ReactNode
}

interface HoloDescriptionsProps {
  items: DescriptionItem[]
  column?: number
  layout?: 'horizontal' | 'vertical'
  className?: string
}

export function HoloDescriptions({
  items,
  column = 1,
  layout = 'horizontal',
  className = '',
}: HoloDescriptionsProps) {
  const isHorizontal = layout === 'horizontal'

  return (
    <div
      className={`
        ${isHorizontal ? 'grid' : 'space-y-4'}
        ${className}
      `}
      style={isHorizontal ? { gridTemplateColumns: `repeat(${column}, 1fr)` } : undefined}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={`
            ${isHorizontal 
              ? 'flex items-start justify-between py-3 border-b border-stroke-muted last:border-b-0'
              : 'space-y-1'
            }
          `}
        >
          <div className={`text-content-tertiary text-sm ${isHorizontal ? 'flex-shrink-0 mr-4' : ''}`}>
            {item.label}
          </div>
          <div className={`text-content-primary text-sm ${isHorizontal ? 'text-right' : ''}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}
