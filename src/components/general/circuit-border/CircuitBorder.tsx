import { useId, type ReactNode } from 'react'

interface CircuitBorderProps {
  children: ReactNode
  className?: string
  animated?: boolean
}

export function CircuitBorder({ children, className = '', animated = true }: CircuitBorderProps) {
  const gradientId = useId()

  const cornerStyle = 'absolute w-5 h-5 pointer-events-none'

  return (
    <div className={`relative ${className}`}>
      {/* 顶部/底部扫描线 */}
      <svg data-shd-motion={animated ? 'decorative' : undefined} className={`absolute inset-0 w-full h-full pointer-events-none overflow-visible ${animated ? 'animate-pulse' : ''}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--holo-cyan)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--holo-cyan)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--holo-cyan)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="0" x2="100%" y2="0" stroke={`url(#${gradientId})`} strokeWidth="1" />
        <line x1="0" y1="100%" x2="100%" y2="100%" stroke={`url(#${gradientId})`} strokeWidth="1" />
      </svg>
      {/* 四角装饰 - 用独立 SVG 避免拉伸 */}
      <svg className={`${cornerStyle} top-0 left-0`} viewBox="0 0 20 20">
        <path d="M0,0 L20,0 L20,5 L5,5 L5,20 L0,20 Z" fill="var(--holo-cyan)" fillOpacity="0.2" />
      </svg>
      <svg className={`${cornerStyle} top-0 right-0`} viewBox="0 0 20 20">
        <path d="M20,0 L20,20 L15,20 L15,5 L0,5 L0,0 Z" fill="var(--holo-cyan)" fillOpacity="0.2" />
      </svg>
      {children}
    </div>
  )
}
