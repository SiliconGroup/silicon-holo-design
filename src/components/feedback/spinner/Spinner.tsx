interface HoloSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

export function HoloSpinner({
  size = 'md',
  label,
  className = '',
}: HoloSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`rounded-full animate-spin ${sizeClasses[size]}`}
        style={{
          border: '2px solid rgba(0, 255, 255, 0.3)',
          borderTopColor: '#00ffff',
        }}
      />
      {label && (
        <span className="text-white/40 text-xs">{label}</span>
      )}
    </div>
  )
}
