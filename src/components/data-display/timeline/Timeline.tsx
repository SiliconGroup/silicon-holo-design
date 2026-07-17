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

const timelineColorClasses: Record<string, string> = {
  cyan: 'bg-accent-primary',
  'cyan-500': 'bg-accent-primary',
  blue: 'bg-accent-blue',
  'blue-500': 'bg-accent-blue',
  purple: 'bg-accent-purple',
  'purple-500': 'bg-accent-purple',
  green: 'bg-status-success',
  'green-500': 'bg-status-success',
  yellow: 'bg-status-warning',
  'yellow-500': 'bg-status-warning',
  red: 'bg-status-error',
  'red-500': 'bg-status-error',
}

export function HoloTimeline({ items, className = '' }: HoloTimelineProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-[5px] top-0 bottom-0 border-l-2 border-stroke-subtle" />
      
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="relative flex items-start">
            <div
              className={`absolute left-0 top-1 w-3 h-3 rounded-full ${item.color ? timelineColorClasses[item.color] ?? '' : 'bg-accent-primary'}`}
              style={item.color && !timelineColorClasses[item.color] ? { backgroundColor: item.color } : undefined}
            >
              {item.icon && (
                <div className="absolute inset-0 flex-center text-xs text-content-on-accent">
                  {item.icon}
                </div>
              )}
            </div>
            
            <div className="ml-8 flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-content-primary font-medium text-sm">
                    {item.title}
                  </div>
                  {item.description && (
                    <div className="text-content-secondary text-sm mt-1">
                      {item.description}
                    </div>
                  )}
                </div>
                {item.time && (
                  <div className="text-content-tertiary text-xs ml-4 flex-shrink-0">
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
