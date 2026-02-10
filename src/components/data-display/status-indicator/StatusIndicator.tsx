import type { ConnectionStatus } from '@/types'

interface StatusConfig {
  color: string
  label: string
  pulse?: boolean
}

const defaultColors: Record<ConnectionStatus, { color: string; pulse?: boolean }> = {
  connected: { color: 'var(--shd-status-success)' },
  connecting: { color: 'var(--shd-status-warning)', pulse: true },
  disconnected: { color: '#666' },
  error: { color: 'var(--shd-status-error)', pulse: true },
}

const defaultLabels: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  connecting: 'Connecting',
  disconnected: 'Disconnected',
  error: 'Error',
}

interface StatusIndicatorProps {
  status: ConnectionStatus
  /** Custom labels per status. Falls back to built-in English labels. */
  labels?: Partial<Record<ConnectionStatus, string>>
  /** Custom colors per status. Falls back to theme CSS variables. */
  colors?: Partial<Record<ConnectionStatus, string>>
}

export function StatusIndicator({ status, labels, colors }: StatusIndicatorProps) {
  const color = colors?.[status] ?? defaultColors[status].color
  const label = labels?.[status] ?? defaultLabels[status]
  const pulse = defaultColors[status].pulse

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-holo-cyan/5 border border-holo-cyan/15">
      <div className="relative">
        <div
          className={`w-2 h-2 rounded-full ${pulse ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
        {status === 'connected' && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: color, opacity: 0.3 }}
          />
        )}
      </div>
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
    </div>
  )
}
