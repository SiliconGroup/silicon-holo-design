import { forwardRef, type ReactNode } from 'react'

interface HoloRadioProps {
  checked?: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export const HoloRadio = forwardRef<HTMLInputElement, HoloRadioProps>(
  (
    {
      checked = false,
      onChange,
      label,
      disabled = false,
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
            type="radio"
            checked={checked}
            onChange={(e) => !disabled && onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only"
          />
          <div
            className={`
              border border-solid rounded-full transition-colors duration-200
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-holo-cyan/50
              ${sizeMap[size]}
              ${checked
                ? 'border-holo-cyan/60'
                : 'border-holo-cyan/30 hover:border-holo-cyan/50'
              }
            `}
          >
            {checked && (
              <div className="w-full h-full flex items-center justify-center">
                <div className={`rounded-full bg-holo-cyan ${size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5'}`} />
              </div>
            )}
          </div>
        </div>
        {label && <span className="text-white/90 text-sm select-none">{label}</span>}
      </label>
    )
  },
)

HoloRadio.displayName = 'HoloRadio'