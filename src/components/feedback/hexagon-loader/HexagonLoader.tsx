import { useId } from 'react'

interface HexagonLoaderProps {
  size?: number
  className?: string
}

export function HexagonLoader({ size = 48, className = '' }: HexagonLoaderProps) {
  const gradientId = useId()

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* 外层旋转 */}
      <svg
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: '3s' }}
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--holo-cyan)" />
            <stop offset="50%" stopColor="var(--holo-blue)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--holo-cyan)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
        />
      </svg>

      {/* 中层反向 */}
      <svg
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: '2s', animationDirection: 'reverse' }}
        viewBox="0 0 100 100"
      >
        <polygon
          points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5"
          fill="none"
          stroke="var(--holo-cyan)"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          strokeDasharray="10 5"
        />
      </svg>

      {/* 内层脉冲 */}
      <svg className="absolute inset-0 animate-pulse" viewBox="0 0 100 100">
        <polygon
          points="50,25 70,37.5 70,62.5 50,75 30,62.5 30,37.5"
          fill="rgba(0, 255, 255, 0.1)"
          stroke="var(--holo-cyan)"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
      </svg>

      {/* 中心点 */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
        style={{ backgroundColor: 'var(--holo-cyan)', boxShadow: '0 0 10px var(--holo-cyan)' }}
      />
    </div>
  )
}
