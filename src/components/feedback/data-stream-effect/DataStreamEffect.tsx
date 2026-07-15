interface DataStreamEffectProps { active: boolean; direction?: 'up' | 'down'; className?: string }

export function DataStreamEffect({ active, direction = 'down', className = '' }: DataStreamEffectProps) {
  if (!active) return null

  return (
    <div
      aria-hidden="true"
      data-shd-motion="decorative"
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--shd-accent-primary-softer),transparent_62%)]" />
      <div
        className={`absolute inset-x-[8%] h-16 bg-gradient-to-b from-transparent via-accent-primary-soft to-transparent blur-sm ${direction === 'down' ? 'animate-[dataStreamDown_2.4s_var(--shd-ease-standard)_infinite]' : 'animate-[dataStreamUp_2.4s_var(--shd-ease-standard)_infinite]'}`}
      />
    </div>
  )
}
