interface HoloProgressProps {
  percent: number
  status?: 'normal' | 'success' | 'error'
  showInfo?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function HoloProgress({
  percent,
  status = 'normal',
  showInfo = true,
  size = 'md',
  className = '',
}: HoloProgressProps) {
  const clampedPercent = Math.min(100, Math.max(0, percent))
  const finalStatus = clampedPercent === 100 ? 'success' : status
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
  }

  const statusColors = {
    normal: 'bg-holo-cyan',
    success: 'bg-status-success',
    error: 'bg-status-error',
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 rounded-full bg-white/10 ${sizeClasses[size]}`}>
        <div
          className={`
            rounded-full transition-all duration-300 ${sizeClasses[size]}
            ${statusColors[finalStatus]}
          `}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      {showInfo && (
        <span className="text-sm text-white/60 min-w-10 text-right">
          {Math.round(clampedPercent)}%
        </span>
      )}
    </div>
  )
}