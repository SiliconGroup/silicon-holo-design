import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from './index'
import { defaultSemanticTokens, defaultTokens } from './tokens'

describe('Theme', () => {
  it('has all required color tokens', () => {
    expect(defaultTokens.colors['holo-cyan']).toBe('#00ffff')
    expect(defaultTokens.colors['scene-void']).toBe('#000a0e')
    expect(defaultTokens.colors['status-success']).toBe('#00ff88')
    expect(defaultTokens.colors['text-primary']).toBe('rgba(255,255,255,0.95)')
  })

  it('provides semantic tokens without changing the legacy token shape', () => {
    expect(defaultSemanticTokens.colors['surface-raised']).toBe('#00191e')
    expect(defaultTokens).toEqual({ colors: expect.any(Object) })
  })

  it('applies and clears primitive and semantic overrides', () => {
    const { rerender, unmount } = render(
      <ThemeProvider theme={{ colors: { 'holo-cyan': '#ff6b35' }, semanticColors: { 'accent-primary': '#ffaa00' } }}>
        <div />
      </ThemeProvider>,
    )

    expect(document.documentElement.style.getPropertyValue('--shd-holo-cyan')).toBe('#ff6b35')
    expect(document.documentElement.style.getPropertyValue('--shd-accent-primary')).toBe('#ffaa00')

    rerender(<ThemeProvider theme={{ colors: { 'holo-cyan': '#33ddff' } }}><div /></ThemeProvider>)
    expect(document.documentElement.style.getPropertyValue('--shd-holo-cyan')).toBe('#33ddff')
    expect(document.documentElement.style.getPropertyValue('--shd-accent-primary')).toBe('')

    unmount()
    expect(document.documentElement.style.getPropertyValue('--shd-holo-cyan')).toBe('')
  })

  it('keeps semantic accent, stroke, and focus roles derived from the final primitive unless explicitly overridden', () => {
    const { rerender, unmount } = render(
      <ThemeProvider theme={{ colors: { 'holo-cyan': '#ff6b35' } }}><div /></ThemeProvider>,
    )

    expect(document.documentElement.style.getPropertyValue('--shd-holo-cyan')).toBe('#ff6b35')
    expect(document.documentElement.style.getPropertyValue('--shd-accent-primary')).toBe('')
    expect(document.documentElement.style.getPropertyValue('--shd-stroke-accent')).toBe('')
    expect(document.documentElement.style.getPropertyValue('--shd-focus-ring')).toBe('')

    rerender(
      <ThemeProvider theme={{
        colors: { 'holo-cyan': '#ff6b35' },
        semanticColors: {
          'accent-primary': '#ffaa00',
          'stroke-accent': '#cc7700',
          'focus-ring': '#ffffff',
        },
      }}><div /></ThemeProvider>,
    )

    expect(document.documentElement.style.getPropertyValue('--shd-accent-primary')).toBe('#ffaa00')
    expect(document.documentElement.style.getPropertyValue('--shd-stroke-accent')).toBe('#cc7700')
    expect(document.documentElement.style.getPropertyValue('--shd-focus-ring')).toBe('#ffffff')

    rerender(<ThemeProvider theme={{ colors: { 'holo-cyan': '#33ddff' } }}><div /></ThemeProvider>)
    expect(document.documentElement.style.getPropertyValue('--shd-accent-primary')).toBe('')
    expect(document.documentElement.style.getPropertyValue('--shd-stroke-accent')).toBe('')
    expect(document.documentElement.style.getPropertyValue('--shd-focus-ring')).toBe('')

    unmount()
  })
})
