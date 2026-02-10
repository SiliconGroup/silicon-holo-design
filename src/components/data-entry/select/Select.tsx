import { forwardRef, useState, useRef, useEffect } from 'react'
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
    },
    ref,
  ) => {
    const locale = useLocale()
    const resolvedPlaceholder = placeholder ?? locale.select.placeholder
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const triggerRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const borderColor = status === 'error'
      ? 'border-status-error/50'
      : status === 'success'
        ? 'border-status-success/50'
        : isOpen
          ? 'border-holo-cyan/50'
          : variant === 'ghost'
            ? 'border-transparent hover:border-holo-cyan/20'
            : 'border-holo-cyan/30 hover:border-holo-cyan/40'

    const filteredOptions = searchable
      ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
      : options

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
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }, [isOpen])

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
      }
    }

    return (
      <div ref={ref} className={`relative ${className}`}>
        <div
          ref={triggerRef}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            flex items-center justify-between cursor-pointer
            rounded-md border border-solid transition-colors duration-200
            bg-scene-void/80 backdrop-blur-sm
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-holo-cyan/50
            ${sizeMap[size]}
            ${borderColor}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          tabIndex={disabled ? -1 : 0}
        >
          <span className={`flex-1 truncate ${displayValue === resolvedPlaceholder ? 'text-white/30' : 'text-white/90'}`}>
            {displayValue}
          </span>
          <svg className="w-4 h-4 text-white/40 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (
          <HoloPortal>
            <div
              ref={dropdownRef}
              className="fixed bg-scene-void/95 backdrop-blur-sm border border-holo-cyan/25 rounded-md shadow-lg z-30 min-w-32 max-h-60 overflow-auto"
              style={{
                top: triggerRef.current ? triggerRef.current.getBoundingClientRect().bottom + 4 : 0,
                left: triggerRef.current ? triggerRef.current.getBoundingClientRect().left : 0,
                width: triggerRef.current ? triggerRef.current.getBoundingClientRect().width : 'auto',
              }}
            >
              {searchable && (
                <div className="p-2 border-b border-holo-cyan/25">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={locale.select.searchPlaceholder}
                    className="w-full px-2 py-1 text-sm bg-transparent border border-holo-cyan/30 rounded text-white/90 placeholder-white/30 focus:border-holo-cyan/50 focus:outline-none"
                  />
                </div>
              )}
              {filteredOptions.map((option) => {
                const isSelected = multiple
                  ? Array.isArray(value) && value.includes(option.value)
                  : value === option.value
                return (
                  <div
                    key={option.value}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    className={`
                      px-3 py-2 text-sm cursor-pointer transition-colors duration-200
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-holo-cyan/8'}
                      ${isSelected ? 'bg-holo-cyan/10 text-holo-cyan border-l-2 border-holo-cyan' : 'text-white/90'}
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