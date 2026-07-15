import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import {
  defaultSemanticTokens,
  defaultTokens,
  type ResolvedThemeTokens,
  type SemanticThemeTokens,
  type ThemeOverride,
  type ThemeTokens,
} from './tokens'

export type { ResolvedThemeTokens, SemanticThemeTokens, ThemeOverride, ThemeTokens } from './tokens'
export { defaultSemanticTokens, defaultTokens } from './tokens'

export interface ThemeProviderProps {
  theme?: ThemeOverride
  children: ReactNode
}

const defaultResolvedTheme: ResolvedThemeTokens = {
  ...defaultTokens,
  semanticColors: defaultSemanticTokens.colors,
}

const ThemeContext = createContext<ResolvedThemeTokens>(defaultResolvedTheme)

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const writtenVariables = useRef(new Set<string>())
  const resolved = useMemo<ResolvedThemeTokens>(() => ({
    colors: { ...defaultTokens.colors, ...theme?.colors },
    semanticColors: { ...defaultSemanticTokens.colors, ...theme?.semanticColors },
  }), [theme])

  useEffect(() => {
    const root = document.documentElement
    const nextVariables = new Map<string, string>()

    for (const [key, value] of Object.entries(resolved.colors)) {
      nextVariables.set(`--shd-${key}`, value)
    }
    for (const [key, value] of Object.entries(theme?.semanticColors ?? {})) {
      nextVariables.set(`--shd-${key}`, value)
    }

    for (const variable of writtenVariables.current) {
      if (!nextVariables.has(variable)) root.style.removeProperty(variable)
    }
    for (const [variable, value] of nextVariables) root.style.setProperty(variable, value)

    writtenVariables.current = new Set(nextVariables.keys())
    return () => {
      for (const variable of writtenVariables.current) root.style.removeProperty(variable)
      writtenVariables.current.clear()
    }
  }, [resolved.colors, theme?.semanticColors])

  return <ThemeContext.Provider value={resolved}>{children}</ThemeContext.Provider>
}

export function useTheme() { return useContext(ThemeContext) }
