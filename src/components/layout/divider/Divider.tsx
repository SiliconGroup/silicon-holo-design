import { type ReactNode } from 'react'

interface HoloDividerProps {
  orientation?: 'horizontal' | 'vertical'
  label?: ReactNode
  className?: string
}

export function HoloDivider({
  orientation = 'horizontal',
  label,
  className = '',
}: HoloDividerProps) {
  if (orientation === 'vertical') {
    return (
      <div className={`inline-block h-full border-l border-holo-cyan/15 ${className}`} />
    )
  }

  if (label) {
    return (
      <div className={`flex items-center gap-3 w-full ${className}`}>
        <div className="flex-1 border-t border-holo-cyan/15" />
        <span className="text-white/30 text-xs">{label}</span>
        <div className="flex-1 border-t border-holo-cyan/15" />
      </div>
    )
  }

  return (
    <div className={`w-full border-t border-holo-cyan/15 ${className}`} />
  )
}