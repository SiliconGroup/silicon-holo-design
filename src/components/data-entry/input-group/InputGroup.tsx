import { useState, type ReactNode, Children, cloneElement, isValidElement, type ReactElement } from 'react'

export interface HoloInputGroupProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost'
  status?: 'error' | 'success'
  className?: string
  disabled?: boolean
}

export interface HoloInputAddonProps {
  children: ReactNode
  className?: string
}

/** 附加块 — 紧贴在输入框前/后，共享容器边框 */
export function HoloInputAddon({ children, className = '' }: HoloInputAddonProps) {
  return (
    <div className={`flex-shrink-0 flex-center self-stretch px-3 text-content-secondary text-sm bg-surface-raised border-stroke-subtle ${className}`}>
      {children}
    </div>
  )
}

HoloInputAddon.displayName = 'HoloInputAddon'

/** 组合容器 — 将 HoloInput/HoloTextarea/HoloInputAddon/IconButton 等组合为一体 */
export function HoloInputGroup({
  children,
  size = 'md',
  variant = 'default',
  status,
  className = '',
  disabled = false,
}: HoloInputGroupProps) {
  const [focused, setFocused] = useState(false)

  const borderColor = status === 'error'
    ? 'border-stroke-error bg-state-error-soft'
    : status === 'success'
      ? 'border-stroke-success bg-state-success-soft'
      : focused
        ? 'border-stroke-accent ring-2 ring-focus ring-offset-1 ring-offset-surface-base'
        : variant === 'ghost'
          ? 'border-transparent hover:border-stroke-subtle'
          : 'border-stroke-default hover:border-stroke-strong'

  const enhancedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child

    const displayName = (child.type as { displayName?: string })?.displayName
    const isInput = displayName === 'HoloInput' || displayName === 'HoloTextarea'

    if (!isInput) return child

    const childProps = child.props as { disabled?: boolean; onFocus?: (e: React.FocusEvent) => void; onBlur?: (e: React.FocusEvent) => void }

    return cloneElement(child as ReactElement, {
      grouped: true,
      size,
      variant,
      status,
      disabled: disabled || childProps.disabled,
      onFocus: (e: React.FocusEvent) => {
        setFocused(true)
        childProps.onFocus?.(e)
      },
      onBlur: (e: React.FocusEvent) => {
        setFocused(false)
        childProps.onBlur?.(e)
      },
    })
  })

  return (
    <div
      className={`
        flex items-end rounded-md border border-solid overflow-hidden
        transition-colors duration-150 bg-surface-interactive
        ${borderColor}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {enhancedChildren}
    </div>
  )
}

HoloInputGroup.displayName = 'HoloInputGroup'
