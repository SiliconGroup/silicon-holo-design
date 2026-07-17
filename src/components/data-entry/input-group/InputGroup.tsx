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
  const [focusVisible, setFocusVisible] = useState(false)

  const borderColor = status === 'error'
    ? 'border-stroke-error bg-state-error-soft'
    : status === 'success'
      ? 'border-stroke-success bg-state-success-soft'
      : focusVisible
        ? 'border-stroke-accent-strong'
      : focused
        ? 'border-stroke-accent'
        : variant === 'ghost'
          ? 'border-transparent hover:border-stroke-subtle'
          : 'border-stroke-default hover:border-stroke-strong'

  const enhancedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child

    const displayName = (child.type as { displayName?: string })?.displayName
    const isInput = displayName === 'HoloInput' || displayName === 'HoloTextarea'

    if (!isInput) return child

    const childProps = child.props as { disabled?: boolean; size?: 'sm' | 'md' | 'lg'; variant?: 'default' | 'ghost'; status?: 'error' | 'success' }

    return cloneElement(child as ReactElement, {
      grouped: true,
      size: childProps.size ?? size,
      variant: childProps.variant ?? variant,
      status: childProps.status ?? status,
      disabled: disabled || childProps.disabled,
    })
  })

  return (
    <div
      onFocusCapture={(event) => {
        setFocused(true)
        const target = event.target as HTMLElement
        setFocusVisible((target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && target.matches(':focus-visible'))
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false)
          setFocusVisible(false)
        }
      }}
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
