const SUFFIX = ' console'

/** Title case a slug and append the product suffix. */
export function formatTitle(name: string): string {
  const normalized = name.trim().toLowerCase()
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}${SUFFIX}`
}
