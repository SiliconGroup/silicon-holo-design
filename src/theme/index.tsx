import { createContext, useContext, useInsertionEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react'
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

export type ThemeVariableStyle = CSSProperties & Record<`--shd-${string}`, string>

const derivedSemanticVariables: Partial<Record<keyof SemanticThemeTokens['colors'], string>> = {
  'surface-canvas': 'var(--shd-scene-void)',
  'surface-base': 'var(--shd-scene-deep)',
  'surface-base-soft': 'color-mix(in srgb, var(--shd-scene-deep) 66%, transparent)',
  'surface-raised': 'color-mix(in srgb, color-mix(in srgb, var(--shd-scene-deep) 97%, var(--shd-holo-blue) 1.5%) 98.5%, var(--shd-holo-cyan) 1.5%)',
  'surface-raised-soft': 'color-mix(in srgb, var(--shd-surface-raised) 76%, transparent)',
  'surface-overlay': 'color-mix(in srgb, color-mix(in srgb, var(--shd-scene-deep) 94%, var(--shd-holo-blue) 4%) 98%, var(--shd-holo-cyan) 2%)',
  'surface-overlay-soft': 'color-mix(in srgb, var(--shd-surface-overlay) 82%, transparent)',
  'surface-inset': 'color-mix(in srgb, var(--shd-scene-void) 88%, black 12%)',
  'surface-glass': 'color-mix(in srgb, var(--shd-surface-overlay) 74%, transparent)',
  'surface-interactive': 'color-mix(in srgb, color-mix(in srgb, var(--shd-scene-deep) 96%, var(--shd-holo-blue) 2%) 98%, var(--shd-holo-cyan) 2%)',
  'surface-interactive-hover': 'color-mix(in srgb, color-mix(in srgb, var(--shd-scene-deep) 90%, var(--shd-holo-blue) 6%) 96%, var(--shd-holo-cyan) 4%)',
  'surface-selected': 'color-mix(in srgb, color-mix(in srgb, var(--shd-scene-deep) 82%, var(--shd-holo-blue) 10%) 92%, var(--shd-holo-cyan) 8%)',
  'content-primary': 'var(--shd-text-primary)',
  'content-secondary': 'var(--shd-text-secondary)',
  'content-tertiary': 'var(--shd-text-muted)',
  'content-accent': 'color-mix(in srgb, var(--shd-holo-cyan) 68%, white 32%)',
  'content-on-accent': 'var(--shd-scene-void)',
  'stroke-accent': 'color-mix(in srgb, var(--shd-holo-cyan) 52%, transparent)',
  'stroke-accent-strong': 'color-mix(in srgb, var(--shd-holo-cyan) 76%, transparent)',
  'stroke-success': 'color-mix(in srgb, var(--shd-status-success) 40%, transparent)',
  'stroke-warning': 'color-mix(in srgb, var(--shd-status-warning) 50%, transparent)',
  'stroke-error': 'color-mix(in srgb, var(--shd-status-error) 65%, transparent)',
  'accent-primary': 'color-mix(in srgb, var(--shd-holo-cyan) 76%, var(--shd-holo-blue) 24%)',
  'accent-primary-hover': 'color-mix(in srgb, var(--shd-accent-primary) 78%, white 22%)',
  'accent-primary-active': 'color-mix(in srgb, var(--shd-accent-primary) 82%, black 18%)',
  'accent-primary-soft': 'color-mix(in srgb, var(--shd-accent-primary) 12%, transparent)',
  'accent-primary-softer': 'color-mix(in srgb, var(--shd-accent-primary) 7%, transparent)',
  'accent-blue': 'var(--shd-holo-blue)',
  'accent-blue-soft': 'color-mix(in srgb, var(--shd-holo-blue) 8%, transparent)',
  'accent-purple': 'var(--shd-holo-purple)',
  'accent-purple-soft': 'color-mix(in srgb, var(--shd-holo-purple) 8%, transparent)',
  'spectral-film-cyan': 'color-mix(in srgb, var(--shd-holo-cyan) 4.5%, transparent)',
  'spectral-film-purple': 'color-mix(in srgb, var(--shd-holo-purple) 2.8%, transparent)',
  'spectral-edge': 'color-mix(in srgb, var(--shd-holo-cyan) 24%, transparent)',
  'focus-ring': 'color-mix(in srgb, color-mix(in srgb, var(--shd-holo-cyan) 74%, white 26%) 78%, transparent)',
  'focus-ring-offset': 'var(--shd-scene-deep)',
  'success-soft': 'color-mix(in srgb, var(--shd-status-success) 10%, transparent)',
  'warning-soft': 'color-mix(in srgb, var(--shd-status-warning) 10%, transparent)',
  'error-soft': 'color-mix(in srgb, var(--shd-status-error) 11%, transparent)',
}

function resolveSemanticColors(override: ThemeOverride): SemanticThemeTokens['colors'] {
  return Object.fromEntries(Object.entries(defaultSemanticTokens.colors).map(([key, fallback]) => {
    const semanticKey = key as keyof SemanticThemeTokens['colors']
    return [key, override.semanticColors?.[semanticKey] ?? derivedSemanticVariables[semanticKey] ?? fallback]
  })) as unknown as SemanticThemeTokens['colors']
}

const defaultResolvedTheme: ResolvedThemeTokens = {
  ...defaultTokens,
  semanticColors: resolveSemanticColors({}),
}

const ThemeContext = createContext<ResolvedThemeTokens>(defaultResolvedTheme)
const ThemeOverrideContext = createContext<ThemeOverride>({})
const ThemeVariableContext = createContext<ThemeVariableStyle | undefined>(undefined)
const ThemeDepthContext = createContext(0)

interface RootThemeLayer { sequence: number; variables: ThemeVariableStyle }
const rootThemeLayers = new Map<symbol, RootThemeLayer>()
const originalRootVariables = new Map<string, string>()
let rootThemeSequence = 0

function applyRootThemeLayers() {
  const root = document.documentElement
  if (rootThemeLayers.size === 0) {
    for (const [variable, value] of originalRootVariables) {
      if (value) root.style.setProperty(variable, value)
      else root.style.removeProperty(variable)
    }
    originalRootVariables.clear()
    return
  }

  const active = [...rootThemeLayers.values()].sort((left, right) => right.sequence - left.sequence)[0]
  const desired = new Map(Object.entries(active.variables).filter(([key]) => key.startsWith('--shd-')))
  const managed = new Set([...originalRootVariables.keys(), ...desired.keys()])
  for (const variable of desired.keys()) {
    if (!originalRootVariables.has(variable)) originalRootVariables.set(variable, root.style.getPropertyValue(variable))
  }
  for (const variable of managed) {
    const value = desired.get(variable)
    if (value !== undefined) root.style.setProperty(variable, String(value))
    else {
      const original = originalRootVariables.get(variable) ?? ''
      if (original) root.style.setProperty(variable, original)
      else root.style.removeProperty(variable)
    }
  }
}

function createThemeVariableStyle(resolved: ResolvedThemeTokens): ThemeVariableStyle {
  const variables: ThemeVariableStyle = { display: 'contents' }
  for (const [key, value] of Object.entries(resolved.colors)) variables[`--shd-${key}`] = value
  for (const [key, value] of Object.entries(resolved.semanticColors)) {
    if (value !== undefined) variables[`--shd-${key}`] = value
  }
  return variables
}

function resolveTheme(theme?: ThemeOverride): ResolvedThemeTokens {
  const override = theme ?? {}
  return {
    colors: { ...defaultTokens.colors, ...override.colors },
    semanticColors: resolveSemanticColors(override),
  }
}

export function createThemeCss(theme?: ThemeOverride, selector = ':root') {
  if (!/^(:root|[.#][A-Za-z_][\w-]*|\[data-[A-Za-z_][\w-]*\])$/.test(selector)) {
    throw new Error('Theme selector must be :root, a simple class/id, or a data attribute selector')
  }
  const variables = createThemeVariableStyle(resolveTheme(theme))
  const declarations = Object.entries(variables)
    .filter(([key]) => key.startsWith('--shd-'))
    .map(([key, value]) => {
      const cssValue = String(value)
      if (/[;{}]|\/\*/.test(cssValue)) throw new Error(`Unsafe CSS theme value for ${key}`)
      return `${key}:${cssValue.replace(/</g, '\\3C ')}`
    })
    .join(';')
  return `${selector}{${declarations}}`
}

export function ThemeStyle({ theme, nonce, selector = ':root' }: { theme?: ThemeOverride; nonce?: string; selector?: string }) {
  return <style nonce={nonce} data-shd-theme-style dangerouslySetInnerHTML={{ __html: createThemeCss(theme, selector) }} />
}

export function ThemeProvider(props: { theme?: Partial<ThemeTokens>; children: ReactNode }): import('react/jsx-runtime').JSX.Element
export function ThemeProvider(props: ThemeProviderProps): import('react/jsx-runtime').JSX.Element
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const layerId = useRef(Symbol('shd-root-theme')).current
  const depth = useContext(ThemeDepthContext)
  const parentOverride = useContext(ThemeOverrideContext)
  const effectiveOverride = useMemo<ThemeOverride>(() => ({
    colors: { ...parentOverride.colors, ...theme?.colors },
    semanticColors: { ...parentOverride.semanticColors, ...theme?.semanticColors },
  }), [parentOverride, theme])
  const resolved = useMemo<ResolvedThemeTokens>(() => resolveTheme(effectiveOverride), [effectiveOverride])
  const variableStyle = useMemo(() => createThemeVariableStyle(resolved), [resolved])

  useInsertionEffect(() => {
    if (depth !== 0) return
    const existing = rootThemeLayers.get(layerId)
    rootThemeLayers.set(layerId, { sequence: existing?.sequence ?? ++rootThemeSequence, variables: variableStyle })
    applyRootThemeLayers()
    return () => {
      rootThemeLayers.delete(layerId)
      applyRootThemeLayers()
    }
  }, [depth, layerId, variableStyle])

  const content = depth === 0
    ? children
    : <div data-shd-theme-provider style={variableStyle}>{children}</div>
  const portalStyle = depth === 0 ? undefined : variableStyle

  return (
    <ThemeDepthContext.Provider value={depth + 1}>
      <ThemeOverrideContext.Provider value={effectiveOverride}>
        <ThemeContext.Provider value={resolved}>
          <ThemeVariableContext.Provider value={portalStyle}>{content}</ThemeVariableContext.Provider>
        </ThemeContext.Provider>
      </ThemeOverrideContext.Provider>
    </ThemeDepthContext.Provider>
  )
}

export function useTheme() { return useContext(ThemeContext) }
export function useThemeVariableStyle() { return useContext(ThemeVariableContext) }
