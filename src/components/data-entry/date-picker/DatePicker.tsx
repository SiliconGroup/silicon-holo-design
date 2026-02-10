import { useState, useRef } from 'react'
import { HoloPortal } from '@/utils/portal'
import { useLocale, formatMessage } from '@/locale'

interface HoloDatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

export function HoloDatePicker({
  value,
  onChange,
  placeholder,
  size = 'md',
  disabled = false,
  className = '',
}: HoloDatePickerProps) {
  const locale = useLocale()
  const resolvedPlaceholder = placeholder ?? locale.datePicker.placeholder
  const [isOpen, setIsOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const triggerRef = useRef<HTMLDivElement>(null)

  const sizeClasses = {
    sm: 'h-8 text-xs px-2.5',
    md: 'h-9 text-sm px-3',
    lg: 'h-11 text-base px-3.5',
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString()
  }

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    onChange(dateStr)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false })
    }
    
    return days
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    if (!value) return false
    const selectedDate = new Date(value)
    return date.toDateString() === selectedDate.toDateString()
  }

  const days = getDaysInMonth(currentDate)

  return (
    <>
      <div
        ref={triggerRef}
        className={`
          flex items-center justify-between rounded-md border border-solid
          transition-colors duration-200 bg-scene-void/80 backdrop-blur-sm
          border-holo-cyan/30 hover:border-holo-cyan/40 cursor-pointer
          ${sizeClasses[size]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`text-white/90 ${!value ? 'text-white/30' : ''}`}>
          {value ? formatDate(value) : resolvedPlaceholder}
        </span>
        <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {isOpen && (
        <HoloPortal>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed z-30 bg-scene-void/95 backdrop-blur-sm border border-holo-cyan/25 rounded-md p-3"
            style={(() => {
              const rect = triggerRef.current?.getBoundingClientRect()
              return rect ? { top: rect.bottom + 4, left: rect.left } : {}
            })()}
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center justify-between mb-3">
              <button
                className="border-none p-1 hover:bg-holo-cyan/10 rounded"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-sm font-medium text-white/80">
                {formatMessage(locale.datePicker.monthYearFormat, { month: locale.datePicker.months[currentDate.getMonth()], year: currentDate.getFullYear() })}
              </div>
              <button
                className="border-none p-1 hover:bg-holo-cyan/10 rounded"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {locale.datePicker.shortWeekdays.map(day => (
                <div key={day} className="text-xs text-white/40 text-center p-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <button
                  key={index}
                  className={`
                    w-8 h-8 text-xs rounded flex items-center justify-center
                    transition-colors duration-200
                    ${day.isCurrentMonth
                      ? isSelected(day.date)
                        ? 'bg-holo-cyan/15 border border-holo-cyan/40 text-holo-cyan'
                        : isToday(day.date)
                          ? 'border border-holo-cyan/40 text-white/70 hover:bg-holo-cyan/8'
                          : 'border-none text-white/70 hover:bg-holo-cyan/8'
                      : 'border-none text-white/20 hover:bg-holo-cyan/5'
                    }
                  `}
                  onClick={() => handleDateSelect(day.date)}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>
          </div>
        </HoloPortal>
      )}
    </>
  )
}