import { forwardRef, type ReactNode } from 'react'

interface HoloSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
  md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
  lg: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' },
}

export const HoloSwitch = forwardRef<HTMLButtonElement, HoloSwitchProps>(
  ({ checked, onChange, label, disabled = false, size = 'md', className = '' }, ref) => {
    const s = sizeMap[size]

    const trackClasses = checked
      ? 'bg-accent-primary-soft border-stroke-accent'
      : 'bg-surface-interactive border-stroke-default'

    const thumbClasses = checked
      ? `${s.translate} bg-accent-primary border border-stroke-accent-strong`
      : 'translate-x-0.5 bg-content-tertiary border border-stroke-subtle'

    const handleClick = () => {
      if (!disabled) onChange(!checked)
    }

    const switchElement = (
      <button
        ref={ref}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={`
          relative inline-flex items-center rounded-full border transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base
          disabled:opacity-50 disabled:cursor-not-allowed
          ${s.track} ${trackClasses} ${className}
        `}
      >
        <span
          className={`
            absolute rounded-full transition-transform duration-150
            ${s.thumb} ${thumbClasses}
          `}
        />
      </button>
    )

    if (label) {
      return (
        <label className="inline-flex items-center gap-2 cursor-pointer">
          {switchElement}
          <span className="text-content-primary">{label}</span>
        </label>
      )
    }

    return switchElement
  }
)

HoloSwitch.displayName = 'HoloSwitch'
