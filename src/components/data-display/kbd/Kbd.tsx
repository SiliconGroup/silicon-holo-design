interface HoloKbdProps {
  children: string
  className?: string
}

export function HoloKbd({ children, className = '' }: HoloKbdProps) {
  return (
    <kbd
      className={`
        inline-flex items-center bg-scene-void/80 border border-holo-cyan/20 rounded
        px-1.5 py-0.5 text-xs font-mono text-white/70 leading-none
        ${className}
      `}
    >
      {children}
    </kbd>
  )
}