import { forwardRef, useState, useRef, useEffect, useId, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { HoloPortal } from '@/utils/portal'
import { useLocale } from '@/locale'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface HoloSelectProps {
  options: SelectOption[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost'
  status?: 'error' | 'success'
  disabled?: boolean
  multiple?: boolean
  searchable?: boolean
  className?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}

const sizeMap = {
  sm: 'h-8 text-xs px-2.5',
  md: 'h-9 text-sm px-3',
  lg: 'h-11 text-base px-3.5',
}

export const HoloSelect = forwardRef<HTMLDivElement, HoloSelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder,
      size = 'md',
      variant = 'default',
      status,
      disabled = false,
      multiple = false,
      searchable = false,
      className = '',
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
    },
    ref,
  ) => {
    const locale = useLocale()
    const listboxId = useId()
    const resolvedPlaceholder = placeholder ?? locale.select.placeholder
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeIndex, setActiveIndex] = useState(-1)
    const [positionVersion, setPositionVersion] = useState(0)
    const triggerRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const borderColor = status === 'error'
      ? 'border-stroke-error bg-state-error-soft'
      : status === 'success'
        ? 'border-stroke-success bg-state-success-soft'
        : isOpen
          ? 'border-stroke-accent bg-surface-selected'
          : variant === 'ghost'
            ? 'border-transparent hover:border-stroke-subtle'
            : 'border-stroke-default hover:border-stroke-strong'

    const filteredOptions = searchable
      ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
      : options

    const enabledOptionIndexes = filteredOptions.reduce<number[]>((indexes, option, index) => {
      if (!option.disabled) indexes.push(index)
      return indexes
    }, [])
    const enabledOptionIndexKey = enabledOptionIndexes.join(',')

    const displayValue = multiple
      ? Array.isArray(value) && value.length > 0
        ? value.map(v => options.find(opt => opt.value === v)?.label).join(', ')
        : resolvedPlaceholder
      : options.find(opt => opt.value === value)?.label || resolvedPlaceholder

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false)
        }
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return
        if (e.key === 'Escape') {
          setIsOpen(false)
          setActiveIndex(-1)
          triggerRef.current?.focus()
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
      const updatePosition = () => setPositionVersion(version => version + 1)
      const frame = isOpen ? requestAnimationFrame(updatePosition) : 0
      if (isOpen) {
        window.addEventListener('resize', updatePosition)
        window.addEventListener('scroll', updatePosition, true)
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition, true)
        if (frame) cancelAnimationFrame(frame)
      }
    }, [isOpen])

    useEffect(() => {
      if (!isOpen) {
        setActiveIndex(-1)
        return
      }

      if (!enabledOptionIndexes.includes(activeIndex)) {
        setActiveIndex(enabledOptionIndexes[0] ?? -1)
      }
    }, [activeIndex, enabledOptionIndexKey, isOpen])

    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const currentValues = Array.isArray(value) ? value : []
        const newValues = currentValues.includes(optionValue)
          ? currentValues.filter(v => v !== optionValue)
          : [...currentValues, optionValue]
        onChange(newValues)
      } else {
        onChange(optionValue)
        setIsOpen(false)
        setActiveIndex(-1)
        queueMicrotask(() => triggerRef.current?.focus())
      }
    }

    const openWithActiveOption = (direction: 'first' | 'last' = 'first') => {
      setIsOpen(true)
      setActiveIndex(direction === 'last'
        ? enabledOptionIndexes[enabledOptionIndexes.length - 1] ?? -1
        : enabledOptionIndexes[0] ?? -1)
    }

    const moveActiveOption = (direction: 1 | -1) => {
      if (enabledOptionIndexes.length === 0) return
      const currentPosition = enabledOptionIndexes.indexOf(activeIndex)
      const nextPosition = currentPosition === -1
        ? direction === 1 ? 0 : enabledOptionIndexes.length - 1
        : (currentPosition + direction + enabledOptionIndexes.length) % enabledOptionIndexes.length
      setActiveIndex(enabledOptionIndexes[nextPosition])
    }

    const handleKeyboardNavigation = (event: ReactKeyboardEvent<HTMLElement>) => {
      if (disabled) return

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        if (!isOpen) {
          openWithActiveOption(event.key === 'ArrowUp' ? 'last' : 'first')
        } else {
          moveActiveOption(event.key === 'ArrowDown' ? 1 : -1)
        }
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!isOpen) {
          openWithActiveOption()
        } else if (activeIndex >= 0) {
          const option = filteredOptions[activeIndex]
          if (option && !option.disabled) handleSelect(option.value)
        }
        return
      }

      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        setIsOpen(false)
        setActiveIndex(-1)
        triggerRef.current?.focus()
      }
    }

    return (
      <div ref={ref} className={`relative ${className}`}>
        <div
          ref={triggerRef}
          id={id}
          role="combobox"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          aria-disabled={disabled || undefined}
          onClick={() => {
            if (disabled) return
            if (isOpen) {
              setIsOpen(false)
              setActiveIndex(-1)
            } else {
              openWithActiveOption()
            }
          }}
          onKeyDown={handleKeyboardNavigation}
          className={`
            flex items-center justify-between cursor-pointer
            rounded-md border border-solid transition-colors duration-150 bg-surface-interactive
            shd-control-focus focus-visible:border-stroke-strong
            ${sizeMap[size]}
            ${borderColor}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          tabIndex={disabled ? -1 : 0}
        >
          <span className={`flex-1 truncate ${displayValue === resolvedPlaceholder ? 'text-content-tertiary' : 'text-content-primary'}`}>
            {displayValue}
          </span>
          <svg className={`w-4 h-4 ml-2 transition-transform duration-150 ${isOpen ? 'rotate-180 text-content-accent' : 'text-content-tertiary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (
          <HoloPortal>
            <div
              ref={dropdownRef}
              id={listboxId}
              role="listbox"
              aria-multiselectable={multiple || undefined}
              onKeyDown={handleKeyboardNavigation}
              className="shd-spectral-glass shd-z-nested-overlay shd-scrollbar box-border fixed border border-stroke-default rounded-md shadow-[0_16px_40px_rgba(0,0,0,0.32)] min-w-32 max-h-60 max-w-[calc(100vw-16px)] overflow-auto p-1"
              style={(() => {
                void positionVersion
                const rect = triggerRef.current?.getBoundingClientRect()
                if (!rect) return {}
                const edge = 8
                const gap = 4
                const panelHeight = dropdownRef.current?.offsetHeight ?? 240
                const width = Math.min(Math.max(rect.width, 128), window.innerWidth - edge * 2)
                return {
                  top: window.innerHeight - rect.bottom >= panelHeight + gap + edge ? rect.bottom + gap : Math.max(edge, rect.top - panelHeight - gap),
                  left: Math.min(window.innerWidth - width - edge, Math.max(edge, rect.left)),
                  width,
                }
              })()}
            >
              {searchable && (
                <div className="p-1.5 border-b border-stroke-muted">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Escape') event.stopPropagation()
                    }}
                    placeholder={locale.select.searchPlaceholder}
                    className="shd-control-focus w-full px-2.5 py-1.5 text-sm bg-surface-interactive border border-stroke-default rounded text-content-primary placeholder-text-content-tertiary focus:border-stroke-accent focus:outline-none"
                  />
                </div>
              )}
              {filteredOptions.map((option, index) => {
                const isSelected = multiple
                  ? Array.isArray(value) && value.includes(option.value)
                  : value === option.value
                return (
                  <div
                    key={option.value}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                    className={`
                      px-3 py-2 text-sm cursor-pointer rounded transition-colors duration-150
                      ${option.disabled ? 'text-content-disabled cursor-not-allowed' : 'hover:bg-surface-interactive-hover'}
                      ${isSelected ? 'bg-surface-selected text-content-accent' : 'text-content-primary'}
                      ${activeIndex === index && !option.disabled ? 'bg-surface-interactive-hover' : ''}
                    `}
                  >
                    {option.label}
                  </div>
                )
              })}
            </div>
          </HoloPortal>
        )}
      </div>
    )
  },
)

HoloSelect.displayName = 'HoloSelect'
