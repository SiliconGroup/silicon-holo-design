interface HoloKbdProps {
  children: string
  className?: string
}

export function HoloKbd({ children, className = '' }: HoloKbdProps) {
  return (
    <kbd
      className={`
        inline-flex items-center bg-surface-raised border border-stroke-default rounded
        px-1.5 py-0.5 text-xs font-mono text-content-secondary leading-none
        ${className}
      `}
    >
      {children}
    </kbd>
  )
}
