import { forwardRef, useState, useRef, useEffect, useImperativeHandle, type TextareaHTMLAttributes, type KeyboardEvent } from 'react'

type NativeTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'>

export interface HoloTextareaProps extends NativeTextareaProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost'
  status?: 'error' | 'success'
  onChange?: (value: string, e: React.ChangeEvent<HTMLTextAreaElement>) => void
  /** 自动调整高度 */
  autoResize?: boolean
  /** 最大自动高度（px） */
  maxAutoHeight?: number
  /** Enter 提交（Shift+Enter 换行） */
  onSubmit?: () => void
  /** 当作为 InputGroup 子组件时，由父组件控制边框 */
  grouped?: boolean
}

const sizeMap = {
  sm: 'text-xs px-2.5 py-1.5',
  md: 'text-sm px-3 py-2.5',
  lg: 'text-base px-3.5 py-3',
}

export const HoloTextarea = forwardRef<HTMLTextAreaElement, HoloTextareaProps>(
  (
    {
      size = 'md',
      variant = 'default',
      status,
      onChange,
      autoResize = false,
      maxAutoHeight = 200,
      onSubmit,
      grouped = false,
      className = '',
      disabled,
      readOnly,
      rows = 1,
      value,
      ...rest
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false)
    const innerRef = useRef<HTMLTextAreaElement>(null)

    useImperativeHandle(ref, () => {
      if (!innerRef.current) throw new Error('HoloTextarea: ref not attached')
      return innerRef.current
    })

    useEffect(() => {
      if (!autoResize || !innerRef.current) return
      const el = innerRef.current
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, maxAutoHeight)}px`
    }, [value, autoResize, maxAutoHeight])

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (onSubmit && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onSubmit()
      }
      rest.onKeyDown?.(e)
    }

    const borderColor = status === 'error'
      ? 'border-stroke-error bg-state-error-soft'
      : status === 'success'
        ? 'border-stroke-success bg-state-success-soft'
        : focused
          ? 'border-stroke-accent'
          : variant === 'ghost'
            ? 'border-transparent hover:border-stroke-subtle'
            : 'border-stroke-default hover:border-stroke-strong'

    const wrapperClasses = grouped
      ? 'flex-1 min-w-0'
      : `rounded-md border border-solid transition-colors duration-150 ${variant === 'ghost' ? 'bg-transparent' : 'bg-surface-interactive'} ${focused ? 'ring-2 ring-focus ring-offset-1 ring-offset-surface-base' : ''} ${borderColor}`

    return (
      <div
        className={`
          ${wrapperClasses}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        <textarea
          ref={innerRef}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          value={value}
          aria-invalid={status === 'error' || undefined}
          onChange={(e) => onChange?.(e.target.value, e)}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e) }}
          onKeyDown={handleKeyDown}
          className={`
            w-full bg-transparent resize-none outline-none
            text-content-primary placeholder-text-content-tertiary
            font-sans leading-relaxed
            disabled:cursor-not-allowed
            ${sizeMap[size]}
          `}
          {...rest}
        />
      </div>
    )
  },
)

HoloTextarea.displayName = 'HoloTextarea'
