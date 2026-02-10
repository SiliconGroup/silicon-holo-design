import { forwardRef, type ReactNode } from 'react'

interface HoloCheckboxProps {
  checked?: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  disabled?: boolean
  indeterminate?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export const HoloCheckbox = forwardRef<HTMLInputElement, HoloCheckboxProps>(
  (
    {
      checked = false,
      onChange,
      label,
      disabled = false,
      indeterminate = false,
      size = 'md',
      className = '',
    },
    ref,
  ) => {
    return (
      <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={(e) => !disabled && onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only"
            role="checkbox"
            aria-checked={indeterminate ? 'mixed' : checked}
          />
          <div
            className={`
              border border-solid rounded transition-colors duration-200
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-holo-cyan/50
              ${sizeMap[size]}
              ${checked || indeterminate
                ? 'bg-holo-cyan/20 border-holo-cyan/60'
                : 'border-holo-cyan/30 hover:border-holo-cyan/50'
              }
            `}
          >
            {checked && !indeterminate && (
              <svg className="w-full h-full text-holo-cyan p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {indeterminate && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2/3 h-0.5 bg-holo-cyan rounded" />
              </div>
            )}
          </div>
        </div>
        {label && <span className="text-white/90 text-sm select-none">{label}</span>}
      </label>
    )
  },
)

HoloCheckbox.displayName = 'HoloCheckbox'