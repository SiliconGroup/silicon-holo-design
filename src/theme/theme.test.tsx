import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createThemeCss, ThemeProvider, ThemeStyle, useTheme } from './index'
import { renderToString } from 'react-dom/server'
import { defaultSemanticTokens, defaultTokens } from './tokens'
import { HoloPortal } from '@/utils/portal'

describe('Theme', () => {
  it('has all required color tokens', () => {
    expect(defaultTokens.colors['holo-cyan']).toBe('#00ffff')
    expect(defaultTokens.colors['scene-void']).toBe('#000a0f')
    expect(defaultTokens.colors['status-success']).toBe('#00ff88')
    expect(defaultTokens.colors['text-primary']).toBe('rgba(255,255,255,0.95)')
  })

  it('provides semantic tokens without changing the legacy token shape', () => {
    expect(defaultSemanticTokens.colors['surface-raised']).toBe('#031a24')
    expect(defaultSemanticTokens.colors['surface-inset']).toBe('#000d13')
    expect(defaultSemanticTokens.colors['surface-glass']).toBe('rgba(4,27,36,0.74)')
    expect(defaultSemanticTokens.colors['content-on-accent']).toBe('#000a0f')
    expect(defaultTokens).toEqual({ colors: expect.any(Object) })
  })

  it('emits deterministic server theme CSS without wrapping application content', () => {
    const css = createThemeCss({ colors: { 'holo-cyan': '#server-cyan' } })
    expect(css).toContain(':root{')
    expect(css).toContain('--shd-holo-cyan:#server-cyan')
    expect(css).toContain('--shd-accent-primary:color-mix')
    expect(css).toContain('--shd-content-on-accent:var(--shd-scene-void)')
    expect(renderToString(<ThemeStyle theme={{ colors: { 'holo-cyan': '#server-cyan' } }} nonce="nonce" />)).toContain('data-shd-theme-style')
  })

  it('escapes theme CSS values and rejects unsafe selectors', () => {
    const css = createThemeCss({ colors: { 'holo-cyan': '</style><script>alert(1)</script>' } })
    expect(css).not.toContain('</style>')
    expect(css).toContain('\\3C /style>')
    expect(() => createThemeCss({}, 'body style, script')).toThrow()
  })

  it('preserves the top-level DOM structure while applying and restoring root variables', () => {
    document.documentElement.style.setProperty('--shd-holo-cyan', '#host-cyan')
    const { container, rerender, unmount } = render(
      <ThemeProvider theme={{ colors: { 'holo-cyan': '#ff6b35' }, semanticColors: { 'accent-primary': '#ffaa00' } }}>
        <table><tbody><tr><td>Cell</td></tr></tbody></table>
      </ThemeProvider>,
    )

    expect(container.firstElementChild?.tagName).toBe('TABLE')
    expect(document.documentElement.style.getPropertyValue('--shd-holo-cyan')).toBe('#ff6b35')
    expect(document.documentElement.style.getPropertyValue('--shd-accent-primary')).toBe('#ffaa00')

    rerender(<ThemeProvider theme={{ colors: { 'holo-cyan': '#33ddff' } }}><table /></ThemeProvider>)
    expect(document.documentElement.style.getPropertyValue('--shd-holo-cyan')).toBe('#33ddff')
    expect(document.documentElement.style.getPropertyValue('--shd-accent-primary')).toContain('var(--shd-holo-cyan)')

    unmount()
    expect(document.documentElement.style.getPropertyValue('--shd-holo-cyan')).toBe('#host-cyan')
    document.documentElement.style.removeProperty('--shd-holo-cyan')
  })

  it('keeps useTheme semantic values aligned with derived and explicit CSS variables', () => {
    let derivedAccent = ''
    function Probe() {
      derivedAccent = useTheme().semanticColors['accent-primary']
      return null
    }

    const { rerender } = render(<ThemeProvider theme={{ colors: { 'holo-cyan': '#ff6b35' } }}><Probe /></ThemeProvider>)
    expect(derivedAccent).toContain('var(--shd-holo-cyan)')
    expect(document.documentElement.style.getPropertyValue('--shd-accent-primary')).toBe(derivedAccent)

    rerender(<ThemeProvider theme={{ semanticColors: { 'accent-primary': '#ffaa00' } }}><Probe /></ThemeProvider>)
    expect(derivedAccent).toBe('#ffaa00')
    expect(document.documentElement.style.getPropertyValue('--shd-accent-primary')).toBe('#ffaa00')
  })

  it('inherits parent overrides in an explicitly nested provider', () => {
    let nestedCyan = ''
    function Probe() {
      nestedCyan = useTheme().colors['holo-cyan']
      return null
    }

    const { container } = render(
      <ThemeProvider theme={{ colors: { 'holo-cyan': '#parent-cyan' }, semanticColors: { 'accent-primary': '#parent-accent' } }}>
        <ThemeProvider theme={{ semanticColors: { 'surface-inset': '#child-inset' } }}><Probe /></ThemeProvider>
      </ThemeProvider>,
    )

    const nested = container.querySelector<HTMLElement>('[data-shd-theme-provider]')
    expect(nestedCyan).toBe('#parent-cyan')
    expect(nested?.style.getPropertyValue('--shd-holo-cyan')).toBe('#parent-cyan')
    expect(nested?.style.getPropertyValue('--shd-accent-primary')).toBe('#parent-accent')
    expect(nested?.style.getPropertyValue('--shd-surface-inset')).toBe('#child-inset')
  })

  it('forwards nested scoped variables into portals', async () => {
    render(
      <ThemeProvider>
        <ThemeProvider theme={{ colors: { 'holo-cyan': '#portal-cyan' } }}>
          <HoloPortal><div data-testid="portal-content" /></HoloPortal>
        </ThemeProvider>
      </ThemeProvider>,
    )

    await screen.findByTestId('portal-content')
    await waitFor(() => {
      const portal = screen.getByTestId('portal-content').parentElement
      expect(portal?.hasAttribute('data-shd-theme-portal')).toBe(true)
      expect(portal?.style.getPropertyValue('--shd-holo-cyan')).toBe('#portal-cyan')
    })
  })
})
