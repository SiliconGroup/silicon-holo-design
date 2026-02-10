import { defineConfig, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({ scale: 1.2, cdn: 'https://esm.sh/' }),
  ],
  theme: {
    colors: {
      holo: {
        cyan: 'rgba(0, 255, 255, %alpha)',
        'cyan-dim': 'rgba(0, 204, 204, %alpha)',
        'cyan-dark': '#001a1a',
        blue: 'rgba(0, 136, 255, %alpha)',
        green: 'rgba(0, 255, 170, %alpha)',
        purple: 'rgba(170, 136, 255, %alpha)',
      },
      scene: {
        void: 'rgba(0, 10, 14, %alpha)',
        deep: 'rgba(0, 16, 24, %alpha)',
        surface: 'rgba(0, 26, 40, %alpha)',
      },
      status: {
        success: 'rgba(0, 255, 136, %alpha)',
        warning: 'rgba(255, 170, 0, %alpha)',
        error: 'rgba(255, 85, 102, %alpha)',
      },
    },
    fontFamily: {
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      sans: ['Inter', '-apple-system', 'sans-serif'],
    },
  },
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'holo-text': 'bg-gradient-to-r from-holo-cyan via-holo-blue to-holo-green bg-clip-text text-transparent',
  },
  safelist: ['holo-text'],
})
