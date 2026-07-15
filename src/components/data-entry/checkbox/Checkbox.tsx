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
            className="sr-only peer"
            role="checkbox"
            aria-checked={indeterminate ? 'mixed' : checked}
          />
          <div
            className={`
              border border-solid rounded transition-colors duration-150
              peer-focus-visible:ring-2 peer-focus-visible:ring-focus peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface-base
              ${sizeMap[size]}
              ${checked || indeterminate
                ? 'bg-accent-primary-soft border-stroke-accent-strong'
                : 'bg-surface-interactive border-stroke-default hover:border-stroke-strong'
              }
            `}
          >
            {checked && !indeterminate && (
              <svg className="w-full h-full text-content-accent p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {indeterminate && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2/3 h-0.5 bg-accent-primary rounded" />
              </div>
            )}
          </div>
        </div>
        {label && <span className="text-content-primary text-sm select-none">{label}</span>}
      </label>
    )
  },
)

HoloCheckbox.displayName = 'HoloCheckbox'
