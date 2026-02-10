interface DataStreamEffectProps { active: boolean; direction?: 'up' | 'down'; className?: string }
export function DataStreamEffect({ active, direction = 'down', className = '' }: DataStreamEffectProps) {
  if (!active) return null
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="absolute w-px bg-gradient-to-b from-transparent via-holo-cyan to-transparent opacity-50"
          style={{ left: `${20 + i * 15}%`, height: '100%', animation: `${direction === 'down' ? 'scan' : 'scan-reverse'} ${2 + i * 0.3}s linear infinite`, animationDelay: `${i * 0.2}s` }} />
      ))}
      <style>{`@keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } } @keyframes scan-reverse { 0% { transform: translateY(100%); } 100% { transform: translateY(-100%); } }`}</style>
    </div>
  )
}
