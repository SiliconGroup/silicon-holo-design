import { describe, expect, it } from 'vitest'
import { createGenerator } from 'unocss'
import { presetUno } from '@unocss/preset-uno'
import { presetSiliconHolo } from './index'

describe('presetSiliconHolo', () => {
  it('generates all multi-segment semantic utilities', async () => {
    const preset = presetSiliconHolo()
    const uno = await createGenerator({ presets: [presetUno(), { ...preset, safelist: [] }] })
    const utilities = [
      'bg-surface-interactive-hover',
      'bg-surface-overlay-soft',
      'bg-surface-inset',
      'bg-surface-glass',
      'border-stroke-accent-strong',
      'bg-accent-primary-soft',
      'bg-accent-primary-softer',
      'bg-state-success-soft',
      'bg-state-warning-soft',
      'bg-state-error-soft',
      'text-content-on-accent',
      'bg-spectral-cyan',
      'border-spectral-edge',
    ]

    for (const utility of utilities) {
      const result = await uno.generate(utility)
      expect(result.matched.has(utility), utility).toBe(true)
      expect(result.css, utility).toContain(`.${utility}`)
    }
  })

  it('keeps the preset-only material contract aligned with the prebuilt stylesheet', () => {
    const css = presetSiliconHolo().preflights[0].getCSS()
    expect(css).toMatch(/button\.shd-local-focus\{[^}]*background-color:transparent[^}]*color:inherit/)
    for (const selector of ['.shd-spectral-panel{', '.shd-spectral-panel-raised{', '.shd-spectral-glass{', '.shd-surface-inset{']) {
      const rule = css.slice(css.indexOf(selector), css.indexOf('}', css.indexOf(selector)) + 1)
      expect(rule, selector).toContain('color:var(--shd-content-primary)')
    }
  })
})
