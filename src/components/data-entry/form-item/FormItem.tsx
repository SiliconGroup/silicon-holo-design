import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react'

interface HoloFormItemProps {
  label?: string
  required?: boolean
  error?: string
  helpText?: string
  children: ReactNode
  className?: string
}

export function HoloFormItem({
  label,
  required = false,
  error,
  helpText,
  children,
  className = '',
}: HoloFormItemProps) {
  const generatedId = useId()
  const controlId = `${generatedId}-control`
  const labelId = `${generatedId}-label`
  const descriptionId = `${generatedId}-description`
  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<{
        id?: string
        'aria-labelledby'?: string
        'aria-describedby'?: string
      }>, {
        id: children.props.id ?? controlId,
        'aria-labelledby': label
          ? [children.props['aria-labelledby'], labelId].filter(Boolean).join(' ')
          : children.props['aria-labelledby'],
        'aria-describedby': error || helpText
          ? [children.props['aria-describedby'], descriptionId].filter(Boolean).join(' ')
          : children.props['aria-describedby'],
      })
    : children

  return (
    <div className={className}>
      {label && (
        <label id={labelId} htmlFor={isValidElement(children) ? children.props.id ?? controlId : undefined} className="block text-content-secondary text-sm mb-1">
          {label}
          {required && <span className="text-status-error ml-1">*</span>}
        </label>
      )}
      {child}
      {error && <div id={descriptionId} className="text-status-error text-xs mt-1">{error}</div>}
      {!error && helpText && <div id={descriptionId} className="text-content-tertiary text-xs mt-1">{helpText}</div>}
    </div>
  )
}
