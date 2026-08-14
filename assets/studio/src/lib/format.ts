const SUFFIX = ' console'

/** Title case a slug and append the product suffix. */
export function formatTitle(name: string): string {
  const normalized = name.trim().toLowerCase()
  if (normalized.length === 0) return `Untitled${SUFFIX}`
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}${SUFFIX}`
}

/** Human readable byte count, used by the telemetry panel. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${Math.round(value * 10) / 10} ${units[unit]}`
}
