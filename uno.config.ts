import { defineConfig, presetIcons, presetUno } from 'unocss'
import { presetSiliconHolo } from './src/preset'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({ scale: 1.2, cdn: 'https://esm.sh/' }),
    presetSiliconHolo(),
  ],
})
