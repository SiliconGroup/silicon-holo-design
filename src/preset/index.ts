import type { Preset } from 'unocss'
import { colors } from './colors'
import { shortcuts } from './shortcuts'
import { safelist } from './safelist'

export { colors } from './colors'
export { shortcuts } from './shortcuts'

export function presetSiliconHolo(): Preset {
  return {
    name: 'silicon-holo',
    preflights: [{
      getCSS: () => `
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--shd-stroke-default)}
button{appearance:none;border-width:0;background:none;padding:0;cursor:pointer;font:inherit;color:inherit}
input,textarea,select{appearance:none;border-width:0;outline:none;background:none;font:inherit;color:inherit}
.shd-spectral-panel{background:linear-gradient(135deg,var(--shd-accent-purple-soft),transparent 42%),linear-gradient(315deg,var(--shd-accent-primary-softer),transparent 48%),var(--shd-surface-base)}
.shd-spectral-panel-raised{background:linear-gradient(135deg,color-mix(in srgb,var(--shd-accent-purple) 5%,transparent),transparent 38%),linear-gradient(315deg,color-mix(in srgb,var(--shd-accent-primary) 4%,transparent),transparent 52%),var(--shd-surface-raised)}
.shd-local-focus:focus-visible{outline:none;background-color:var(--shd-surface-selected);box-shadow:inset 2px 0 0 var(--shd-focus-ring)}
.shd-local-active{background-color:var(--shd-accent-primary-softer);box-shadow:inset 2px 0 0 var(--shd-stroke-accent)}
`,
    }],
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
