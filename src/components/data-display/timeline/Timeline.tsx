import type { ReactNode } from 'react'

interface TimelineItem {
  title: ReactNode
  description?: ReactNode
  time?: string
  color?: string
  icon?: ReactNode
}

interface HoloTimelineProps {
  items: TimelineItem[]
  className?: string
}

export function HoloTimeline({ items, className = '' }: HoloTimelineProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-1.5 top-0 bottom-0 w-0.5 border-l-2 border-holo-cyan/20" />
      
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="relative flex items-start">
            <div
              className={`
                absolute left-0 top-1 w-3 h-3 rounded-full -translate-x-1
                ${item.color ? `bg-${item.color}` : 'bg-holo-cyan/60'}
                shadow-[0_0_4px_rgba(0,255,255,0.4)]
              `}
            >
              {item.icon && (
                <div className="absolute inset-0 flex-center text-xs text-scene-void">
                  {item.icon}
                </div>
              )}
            </div>
            
            <div className="ml-8 flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-white/90 font-medium text-sm">
                    {item.title}
                  </div>
                  {item.description && (
                    <div className="text-white/60 text-sm mt-1">
                      {item.description}
                    </div>
                  )}
                </div>
                {item.time && (
                  <div className="text-white/30 text-xs ml-4 flex-shrink-0">
                    {item.time}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}