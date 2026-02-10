import { useState, type ReactNode } from 'react'

interface HoloAvatarProps {
  src?: string
  alt?: string
  fallback?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
  className?: string
}

export function HoloAvatar({
  src,
  alt = '',
  fallback,
  size = 'md',
  shape = 'circle',
  className = '',
}: HoloAvatarProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  const shapeClasses = shape === 'circle' ? 'rounded-full' : 'rounded-md'

  const showFallback = !src || imageError

  const defaultFallback = alt ? alt.charAt(0).toUpperCase() : (
    <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  )

  return (
    <div
      className={`
        ${sizeClasses[size]} ${shapeClasses}
        border border-holo-cyan/20 overflow-hidden
        flex items-center justify-center
        ${showFallback ? 'bg-holo-cyan/10 text-holo-cyan' : ''}
        ${className}
      `}
    >
      {showFallback ? (
        fallback || defaultFallback
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  )
}