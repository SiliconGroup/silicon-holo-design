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
      'border-stroke-accent-strong',
      'bg-accent-primary-soft',
      'bg-accent-primary-softer',
      'bg-state-success-soft',
      'bg-state-warning-soft',
      'bg-state-error-soft',
    ]

    for (const utility of utilities) {
      const result = await uno.generate(utility)
      expect(result.matched.has(utility), utility).toBe(true)
      expect(result.css, utility).toContain(`.${utility}`)
    }
  })
})
