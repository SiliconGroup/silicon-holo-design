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
        ${isHorizontal
          ? 'grid overflow-hidden rounded-sm border border-stroke-subtle bg-surface-base-soft'
          : 'grid gap-2'}
        ${className}
      `}
      style={{ gridTemplateColumns: `repeat(${Math.max(1, column)}, minmax(0, 1fr))` }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={`
            ${isHorizontal
              ? 'grid min-w-0 grid-cols-[minmax(7rem,0.35fr)_minmax(0,1fr)] items-start gap-4 border-b border-stroke-muted px-3 py-2.5 last:border-b-0'
              : 'min-w-0 rounded-sm border border-stroke-muted bg-surface-interactive px-3 py-2.5'
            }
          `}
        >
          <div className="min-w-0 text-sm text-content-tertiary">
            {item.label}
          </div>
          <div className={`min-w-0 break-words text-sm text-content-primary ${isHorizontal ? 'text-right' : 'mt-1'}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}
