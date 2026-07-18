import { useState, useRef, useEffect, useId, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { HoloPortal } from '@/utils/portal'
import { useLocale, formatMessage } from '@/locale'
import { trapFocus } from '@/utils/focus'

interface HoloDatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

function parseCalendarDate(value?: string) {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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
  const [currentDate, setCurrentDate] = useState(() => parseCalendarDate(value) ?? new Date())
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [keyboardFocusDate, setKeyboardFocusDate] = useState<string | null>(null)
  const panelId = useId()
  const [positionVersion, setPositionVersion] = useState(0)

  const sizeClasses = {
    sm: 'h-8 text-xs px-2.5',
    md: 'h-9 text-sm px-3',
    lg: 'h-11 text-base px-3.5',
  }

  const formatDate = (dateStr: string) => {
    const date = parseCalendarDate(dateStr)
    if (!date) return dateStr
    return date.toLocaleDateString(locale.locale)
  }

  const handleDateSelect = (date: Date) => {
    const dateStr = formatDateKey(date)
    onChange(dateStr)
    setIsOpen(false)
    queueMicrotask(() => triggerRef.current?.focus())
  }

  const closeAndRestoreFocus = () => {
    setIsOpen(false)
    queueMicrotask(() => triggerRef.current?.focus())
  }

  const openCalendar = () => {
    setKeyboardFocusDate(null)
    setCurrentDate(parseCalendarDate(value) ?? new Date())
    setIsOpen(true)
  }

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (isOpen) closeAndRestoreFocus()
      else openCalendar()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      openCalendar()
    }
  }

  useEffect(() => {
    if (!isOpen) return

    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLButtonElement>('[data-calendar-active="true"]')?.focus()
    }, 0)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeAndRestoreFocus()
      } else if (event.key === 'Tab' && panelRef.current) {
        trapFocus(event, panelRef.current)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const updatePosition = () => setPositionVersion(version => version + 1)
    const frame = requestAnimationFrame(updatePosition)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      cancelAnimationFrame(frame)
    }
  }, [isOpen])

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      setIsOpen(false)
      queueMicrotask(() => triggerRef.current?.focus())
      return
    }
    const target = event.target as HTMLElement
    const index = Number(target.dataset.dateIndex)
    if (!Number.isInteger(index)) return
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    let nextIndex = index
    if (event.key in offsets) nextIndex = index + offsets[event.key]
    else if (event.key === 'Home') nextIndex = index - (index % 7)
    else if (event.key === 'End') nextIndex = index + (6 - (index % 7))
    else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const sourceDate = days[index]?.date
      if (!sourceDate) return
      const monthOffset = event.key === 'PageUp' ? -1 : 1
      const targetMonth = sourceDate.getMonth() + monthOffset
      const lastDay = new Date(sourceDate.getFullYear(), targetMonth + 1, 0).getDate()
      const targetDate = new Date(sourceDate.getFullYear(), targetMonth, Math.min(sourceDate.getDate(), lastDay))
      setKeyboardFocusDate(formatDateKey(targetDate))
      setCurrentDate(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1))
      event.preventDefault()
      return
    } else return
    const next = panelRef.current?.querySelector<HTMLButtonElement>(`[data-date-index="${nextIndex}"]`)
    if (next) {
      event.preventDefault()
      next.focus()
    } else if (event.key in offsets) {
      const sourceDate = days[index]?.date
      if (!sourceDate) return
      const targetDate = new Date(sourceDate)
      targetDate.setDate(targetDate.getDate() + offsets[event.key])
      setKeyboardFocusDate(formatDateKey(targetDate))
      setCurrentDate(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1))
      event.preventDefault()
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
    const selectedDate = parseCalendarDate(value)
    if (!selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const days = getDaysInMonth(currentDate)
  const keyboardFocusIndex = keyboardFocusDate ? days.findIndex(day => formatDateKey(day.date) === keyboardFocusDate) : -1
  const selectedIndex = days.findIndex(day => isSelected(day.date))
  const todayIndex = days.findIndex(day => day.isCurrentMonth && isToday(day.date))
  const activeIndex = keyboardFocusIndex >= 0 ? keyboardFocusIndex : selectedIndex >= 0 ? selectedIndex : todayIndex >= 0 ? todayIndex : days.findIndex(day => day.isCurrentMonth)

  useEffect(() => {
    if (!keyboardFocusDate) return
    const timer = window.setTimeout(() => panelRef.current?.querySelector<HTMLButtonElement>('[data-calendar-active="true"]')?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [currentDate, keyboardFocusDate])

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        className={`
          w-full appearance-none flex items-center justify-between rounded-md border border-solid text-left
          transition-colors duration-150 bg-surface-interactive
          border-stroke-default hover:border-stroke-strong cursor-pointer
          shd-control-focus
          ${sizeClasses[size]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        onClick={() => {
          if (disabled) return
          if (isOpen) closeAndRestoreFocus()
          else openCalendar()
        }}
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
            className="shd-z-nested-overlay fixed inset-0"
            onClick={closeAndRestoreFocus}
          />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label={resolvedPlaceholder}
            className="shd-z-nested-overlay shd-scrollbar box-border fixed max-h-[calc(100vh-16px)] max-w-[calc(100vw-16px)] overflow-auto bg-surface-overlay-soft backdrop-blur-md border border-stroke-default rounded-md p-3 shadow-[0_16px_40px_rgba(0,0,0,0.32)]"
            style={(() => {
              void positionVersion
              const rect = triggerRef.current?.getBoundingClientRect()
              if (!rect) return {}
              const panelWidth = panelRef.current?.offsetWidth ?? 284
              const panelHeight = panelRef.current?.offsetHeight ?? 340
              const edge = 8
              const gap = 4
              const top = window.innerHeight - rect.bottom >= panelHeight + gap + edge
                ? rect.bottom + gap
                : Math.max(edge, rect.top - panelHeight - gap)
              const left = Math.min(window.innerWidth - panelWidth - edge, Math.max(edge, rect.left))
              return { top, left }
            })()}
            onKeyDown={handlePanelKeyDown}
          >
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                aria-label={locale.datePicker.previousMonth ?? 'Previous month'}
                className="shd-control-focus appearance-none border border-transparent bg-transparent p-1 text-content-tertiary hover:text-content-primary hover:bg-surface-interactive rounded"
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
                aria-label={locale.datePicker.nextMonth ?? 'Next month'}
                className="shd-control-focus appearance-none border border-transparent bg-transparent p-1 text-content-tertiary hover:text-content-primary hover:bg-surface-interactive rounded"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div role="row" className="grid grid-cols-7 gap-1 mb-2">
              {locale.datePicker.shortWeekdays.map(day => (
                <div role="columnheader" key={day} className="text-xs text-content-tertiary text-center p-1">
                  {day}
                </div>
              ))}
            </div>

            <div role="grid" aria-label={formatMessage(locale.datePicker.monthYearFormat, { month: locale.datePicker.months[currentDate.getMonth()], year: currentDate.getFullYear() })} className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <button
                  type="button"
                  role="gridcell"
                  aria-label={day.date.toLocaleDateString(locale.locale)}
                  aria-selected={isSelected(day.date)}
                  data-date-index={index}
                  data-date-key={formatDateKey(day.date)}
                  data-calendar-active={index === activeIndex ? 'true' : undefined}
                  tabIndex={index === activeIndex ? 0 : -1}
                  key={index}
                  className={`
                    shd-control-focus appearance-none bg-transparent w-8 h-8 text-xs rounded flex items-center justify-center
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
