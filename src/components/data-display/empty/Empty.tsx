import { type ReactNode } from 'react'
import { useLocale } from '@/locale'

interface HoloEmptyProps {
  description?: ReactNode
  icon?: ReactNode
  children?: ReactNode
  className?: string
}

const defaultIcon = (
  <svg className="w-12 h-12 text-holo-cyan/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
)

export function HoloEmpty({
  description,
  icon,
  children,
  className = '',
}: HoloEmptyProps) {
  const locale = useLocale()
  const resolvedDescription = description ?? locale.common.empty
  return (
    <div className={`flex flex-col items-center py-8 gap-3 ${className}`}>
      {icon ?? defaultIcon}
      <div className="text-white/40 text-sm">{resolvedDescription}</div>
      {children}
    </div>
  )
}