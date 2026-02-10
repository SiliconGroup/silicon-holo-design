import type { ReactNode } from 'react'

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
  return (
    <div className={className}>
      {label && (
        <label className="block text-white/60 text-sm mb-1">
          {label}
          {required && <span className="text-status-error ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <div className="text-status-error text-xs mt-1">{error}</div>}
      {!error && helpText && <div className="text-white/30 text-xs mt-1">{helpText}</div>}
    </div>
  )
}