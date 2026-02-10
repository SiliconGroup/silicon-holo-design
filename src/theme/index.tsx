import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { defaultTokens, type ThemeTokens } from './tokens'

export type { ThemeTokens } from './tokens'
export { defaultTokens } from './tokens'

const ThemeContext = createContext<ThemeTokens>(defaultTokens)

export function ThemeProvider({ theme, children }: { theme?: Partial<ThemeTokens>; children: ReactNode }) {
  const merged = { ...defaultTokens, colors: { ...defaultTokens.colors, ...theme?.colors } }

  useEffect(() => {
    const root = document.documentElement
    for (const [key, value] of Object.entries(merged.colors)) {
      root.style.setProperty(`--shd-${key}`, value)
    }
  }, [merged])

  return <ThemeContext.Provider value={merged}>{children}</ThemeContext.Provider>
}

export function useTheme() { return useContext(ThemeContext) }
