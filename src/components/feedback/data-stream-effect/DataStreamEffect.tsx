interface DataStreamEffectProps { active: boolean; direction?: 'up' | 'down'; className?: string }

export function DataStreamEffect({ active, direction = 'down', className = '' }: DataStreamEffectProps) {
  if (!active) return null

  return (
    <div
      aria-hidden="true"
      data-shd-motion="decorative"
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      <div
        className={`absolute inset-x-[8%] h-px bg-accent-primary opacity-55 shadow-[0_0_12px_var(--shd-accent-primary-soft)] ${direction === 'down' ? 'animate-[dataStreamDown_2.4s_var(--shd-ease-standard)_infinite]' : 'animate-[dataStreamUp_2.4s_var(--shd-ease-standard)_infinite]'}`}
      />
    </div>
  )
}
