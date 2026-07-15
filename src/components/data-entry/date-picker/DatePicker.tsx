import { useState, useRef, useEffect, type KeyboardEvent as ReactKeyboardEvent } from 'react'
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

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
    queueMicrotask(() => triggerRef.current?.focus())
  }

  const closeAndRestoreFocus = () => {
    setIsOpen(false)
    queueMicrotask(() => triggerRef.current?.focus())
  }

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(open => !open)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
    }
  }

  useEffect(() => {
    if (!isOpen) return

    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    }, 0)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeAndRestoreFocus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      setIsOpen(false)
      queueMicrotask(() => triggerRef.current?.focus())
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
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`
          w-full appearance-none flex items-center justify-between rounded-md border border-solid text-left
          transition-colors duration-150 bg-surface-interactive
          border-stroke-default hover:border-stroke-strong cursor-pointer
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus
          ${sizeClasses[size]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={`text-content-primary ${!value ? 'text-content-tertiary' : ''}`}>
          {value ? formatDate(value) : resolvedPlaceholder}
        </span>
        <svg className="w-4 h-4 text-content-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <HoloPortal>
          <div
            className="fixed inset-0 z-20"
            onClick={closeAndRestoreFocus}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-label={resolvedPlaceholder}
            className="fixed z-60 bg-surface-overlay-soft backdrop-blur-md border border-stroke-default rounded-md p-3 shadow-[0_16px_40px_rgba(0,0,0,0.32)]"
            style={(() => {
              const rect = triggerRef.current?.getBoundingClientRect()
              return rect ? { top: rect.bottom + 4, left: rect.left } : {}
            })()}
            onKeyDown={handlePanelKeyDown}
          >
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                aria-label="Previous month"
                className="border-none p-1 text-content-tertiary hover:text-content-primary hover:bg-surface-interactive rounded"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-sm font-medium text-content-primary">
                {formatMessage(locale.datePicker.monthYearFormat, { month: locale.datePicker.months[currentDate.getMonth()], year: currentDate.getFullYear() })}
              </div>
              <button
                type="button"
                aria-label="Next month"
                className="border-none p-1 text-content-tertiary hover:text-content-primary hover:bg-surface-interactive rounded"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {locale.datePicker.shortWeekdays.map(day => (
                <div key={day} className="text-xs text-content-tertiary text-center p-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <button
                  type="button"
                  aria-label={day.date.toLocaleDateString()}
                  key={index}
                  className={`
                    w-8 h-8 text-xs rounded flex items-center justify-center
                    transition-colors duration-200
                    ${day.isCurrentMonth
                      ? isSelected(day.date)
                        ? 'bg-surface-selected border border-stroke-accent text-content-accent'
                        : isToday(day.date)
                          ? 'border border-stroke-accent text-content-primary hover:bg-surface-interactive-hover'
                          : 'border border-transparent text-content-secondary hover:bg-surface-interactive-hover'
                      : 'border border-transparent text-content-disabled hover:bg-surface-interactive'
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
