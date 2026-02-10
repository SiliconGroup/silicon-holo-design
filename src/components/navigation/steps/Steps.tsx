import type { ReactNode } from 'react'

interface StepItem {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
}

interface HoloStepsProps {
  current: number
  items: StepItem[]
  direction?: 'horizontal' | 'vertical'
  className?: string
}

export function HoloSteps({
  current,
  items,
  direction = 'horizontal',
  className = '',
}: HoloStepsProps) {
  const isHorizontal = direction === 'horizontal'

  return (
    <div className={`${isHorizontal ? 'flex items-center' : 'flex flex-col'} ${className}`}>
      {items.map((item, index) => {
        const isCompleted = index < current
        const isCurrent = index === current
        const isLast = index === items.length - 1

        return (
          <div
            key={index}
            className={`
              flex items-center
              ${isHorizontal ? 'flex-row' : 'flex-col'}
              ${!isLast && !isHorizontal ? 'mb-6' : ''}
            `}
          >
            <div className={`flex items-center ${isHorizontal ? 'flex-row' : 'flex-col'}`}>
              <div
                className={`
                  w-8 h-8 rounded-full flex-center text-sm font-medium
                  transition-all duration-200 relative
                  ${isCompleted 
                    ? 'bg-holo-cyan text-scene-void shadow-[0_0_8px_rgba(0,255,255,0.5)]' 
                    : isCurrent 
                      ? 'bg-holo-cyan text-scene-void shadow-[0_0_12px_rgba(0,255,255,0.6)]' 
                      : 'bg-white/30 text-white/60'
                  }
                `}
              >
                {isCompleted ? (
                  <span>✓</span>
                ) : item.icon ? (
                  item.icon
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <div className={`${isHorizontal ? 'ml-3' : 'mt-2 text-center'}`}>
                <div
                  className={`
                    text-sm font-medium
                    ${isCurrent ? 'text-holo-cyan' : 'text-white/70'}
                  `}
                >
                  {item.title}
                </div>
                {item.description && (
                  <div className="text-xs text-white/40 mt-1">
                    {item.description}
                  </div>
                )}
              </div>
            </div>

            {!isLast && (
              <div
                className={`
                  ${isHorizontal 
                    ? 'flex-1 h-0.5 mx-4' 
                    : 'w-0.5 h-6 mx-auto my-2'
                  }
                  ${isCompleted ? 'bg-holo-cyan/40' : 'bg-white/10'}
                  transition-colors duration-200
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}