import { createContext, useContext, type ReactNode } from 'react'
import type { Locale } from './types'
import enUS from './en-US'

export type { Locale } from './types'

const LocaleContext = createContext<Locale>(enUS)

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocale(): Locale {
  return useContext(LocaleContext)
}

export function formatMessage(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''))
}

export { default as enUS } from './en-US'
export { default as zhCN } from './zh-CN'
