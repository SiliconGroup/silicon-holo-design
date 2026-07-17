import { defineConfig, presetIcons, presetUno } from 'unocss'
import { presetSiliconHolo } from './src/preset'

export default defineConfig({
  presets: [
    presetUno({ preflight: 'on-demand', variablePrefix: 'shd-un-' }),
    presetIcons({ scale: 1.2 }),
    presetSiliconHolo(),
  ],
})
