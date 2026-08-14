import { useMemo } from 'react'
import { enUS, useLocale, type Locale } from '@/locale'

export type StudioLocale = NonNullable<Locale['studio']>

/**
 * locale.studio 是可选分组，自定义 locale 可能完全没有它。
 * 这里统一兜底到 en-US 的文案，组件因此永远不需要解引用可选字段。
 */
const fallbackStudioLocale = enUS.studio as StudioLocale

export function useStudioLocale(): StudioLocale {
  const locale = useLocale()
  const overrides = locale.studio
  return useMemo(() => (overrides ? { ...fallbackStudioLocale, ...overrides } : fallbackStudioLocale), [overrides])
}

/** 人类可读的字节数，用于文件体积超限提示。 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value >= 10 ? Math.round(value) : Math.round(value * 10) / 10} ${units[unit]}`
}
