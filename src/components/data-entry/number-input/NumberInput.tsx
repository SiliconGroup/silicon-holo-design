import { forwardRef, useState, type KeyboardEvent } from 'react'

interface HoloNumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  precision?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

const sizeMap = {
  sm: { wrapper: 'h-8', input: 'text-xs px-2', button: 'w-6 text-xs' },
  md: { wrapper: 'h-9', input: 'text-sm px-3', button: 'w-7 text-sm' },
  lg: { wrapper: 'h-11', input: 'text-base px-3.5', button: 'w-8 text-base' },
}

export const HoloNumberInput = forwardRef<HTMLInputElement, HoloNumberInputProps>(
  (
    {
      value,
      onChange,
      min,
      max,
      step = 1,
      precision,
      size = 'md',
      disabled = false,
      className = '',
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false)
    const [focusVisible, setFocusVisible] = useState(false)
    const s = sizeMap[size]

    const clampValue = (val: number) => {
      let clamped = val
      if (min !== undefined) clamped = Math.max(min, clamped)
      if (max !== undefined) clamped = Math.min(max, clamped)
      if (precision !== undefined) clamped = Number(clamped.toFixed(precision))
      return clamped
    }

    const handleIncrement = () => onChange(clampValue(value + step))
    const handleDecrement = () => onChange(clampValue(value - step))

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleIncrement()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleDecrement()
      }
    }

    const borderColor = focused
      ? focusVisible
        ? 'border-stroke-accent-strong'
        : 'border-stroke-accent'
      : 'border-stroke-default hover:border-stroke-strong'

    return (
      <div
        className={`
          flex items-center ${s.wrapper} rounded-md border border-solid
          transition-colors duration-150 bg-surface-interactive
          ${borderColor}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        <button
          type="button"
          aria-label="Decrease value"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && value <= min)}
          className={`
            ${s.button} shd-control-focus h-full flex-center border-none bg-transparent text-content-tertiary hover:text-content-accent hover:bg-surface-interactive-hover
            transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          −
        </button>
        <input
          ref={ref}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => onChange(clampValue(Number(e.target.value) || 0))}
          onKeyDown={handleKeyDown}
          onFocus={(event) => { setFocused(true); setFocusVisible(event.currentTarget.matches(':focus-visible')) }}
          onBlur={() => { setFocused(false); setFocusVisible(false) }}
          className={`
            flex-1 min-w-0 border-none bg-transparent outline-none text-center
            text-content-primary font-mono leading-normal
            disabled:cursor-not-allowed appearance-none
            [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
            ${s.input}
          `}
        />
        <button
          type="button"
          aria-label="Increase value"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
          className={`
            ${s.button} shd-control-focus h-full flex-center border-none bg-transparent text-content-tertiary hover:text-content-accent hover:bg-surface-interactive-hover
            transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          +
        </button>
      </div>
    )
  },
)

HoloNumberInput.displayName = 'HoloNumberInput'
