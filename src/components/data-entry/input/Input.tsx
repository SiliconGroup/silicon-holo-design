import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'

type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'onChange'>

export interface HoloInputProps extends NativeInputProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost'
  status?: 'error' | 'success'
  prefix?: ReactNode
  suffix?: ReactNode
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement>) => void
  /** 当作为 InputGroup 子组件时，由父组件控制边框 */
  grouped?: boolean
}

const sizeMap = {
  sm: { wrapper: 'h-8 text-xs gap-1.5', input: 'px-2.5', icon: 'px-2' },
  md: { wrapper: 'h-9 text-sm gap-2', input: 'px-3', icon: 'px-2.5' },
  lg: { wrapper: 'h-11 text-base gap-2', input: 'px-3.5', icon: 'px-3' },
}

export const HoloInput = forwardRef<HTMLInputElement, HoloInputProps>(
  (
    {
      size = 'md',
      variant = 'default',
      status,
      prefix,
      suffix,
      onChange,
      grouped = false,
      className = '',
      disabled,
      readOnly,
      ...rest
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false)
    const s = sizeMap[size]

    const borderColor = status === 'error'
      ? 'border-status-error/50'
      : status === 'success'
        ? 'border-status-success/50'
        : focused
          ? 'border-holo-cyan/50'
          : variant === 'ghost'
            ? 'border-transparent hover:border-holo-cyan/20'
            : 'border-holo-cyan/30 hover:border-holo-cyan/40'

    const wrapperClasses = grouped
      ? `flex items-center ${s.wrapper} bg-transparent`
      : `flex items-center ${s.wrapper} rounded-md border border-solid transition-colors duration-200 bg-scene-void/80 backdrop-blur-sm ${borderColor}`

    return (
      <div
        className={`
          ${wrapperClasses}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        {prefix && (
          <span className={`flex-shrink-0 flex-center ${s.icon} text-white/40 ${focused ? 'text-holo-cyan/70' : ''} transition-colors duration-200`} aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={status === 'error' || undefined}
          onChange={(e) => onChange?.(e.target.value, e)}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e) }}
          className={`
            flex-1 min-w-0 bg-transparent outline-none
            text-white/90 placeholder-white/30
            font-sans leading-normal
            disabled:cursor-not-allowed
            ${!prefix ? s.input : 'pr-1'}
            ${!suffix ? s.input : 'pl-1'}
            ${prefix && suffix ? 'px-0' : ''}
          `}
          {...rest}
        />
        {suffix && (
          <span className={`flex-shrink-0 flex-center ${s.icon} text-white/40 ${focused ? 'text-holo-cyan/70' : ''} transition-colors duration-200`} aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
    )
  },
)

HoloInput.displayName = 'HoloInput'
