import type { Preset } from 'unocss'
import { colors } from './colors'
import { shortcuts } from './shortcuts'
import { safelist } from './safelist'

export function presetSiliconHolo(): Preset {
  return {
    name: 'silicon-holo',
    theme: {
      colors,
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
    },
    shortcuts,
    safelist,
  }
}
