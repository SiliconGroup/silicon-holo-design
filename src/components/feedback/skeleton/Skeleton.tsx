import type { ReactNode } from 'react'

interface HoloSkeletonProps {
  loading: boolean
  rows?: number
  avatar?: boolean
  title?: boolean
  children: ReactNode
  className?: string
}

export function HoloSkeleton({
  loading,
  rows = 3,
  avatar = false,
  title = true,
  children,
  className = '',
}: HoloSkeletonProps) {
  if (!loading) return <>{children}</>

  return (
    <div className={`animate-pulse ${className}`}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>
      
      <div className="flex items-start gap-3">
        {avatar && (
          <div className="w-10 h-10 rounded-full bg-white/5 shimmer flex-shrink-0" />
        )}
        
        <div className="flex-1 space-y-3">
          {title && (
            <div className="h-5 w-3/5 rounded bg-white/5 shimmer" />
          )}
          
          <div className="space-y-2">
            {Array.from({ length: rows }).map((_, i) => (
              <div
                key={i}
                className={`
                  h-4 rounded bg-white/5 shimmer
                  ${i === rows - 1 ? 'w-4/5' : 'w-full'}
                `}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}