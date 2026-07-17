import { colors } from './colors'
import { shortcuts } from './shortcuts'
import { safelist } from './safelist'

export { colors } from './colors'
export { shortcuts } from './shortcuts'

export function presetSiliconHolo() {
  return {
    name: 'silicon-holo',
    preflights: [{
      getCSS: () => `
.border,.border-x,.border-y,.border-t,.border-r,.border-b,.border-l{border-style:solid}
button.shd-control-focus,button.shd-local-focus{appearance:none;font:inherit}
button.shd-local-focus{background-color:transparent;color:inherit}
.shd-spectral-panel{background:linear-gradient(135deg,var(--shd-spectral-film-cyan),transparent 46%),linear-gradient(315deg,var(--shd-spectral-film-purple),transparent 54%),var(--shd-surface-base-soft);box-shadow:inset 0 1px 0 var(--shd-spectral-highlight);color:var(--shd-content-primary)}
.shd-spectral-panel-raised{background:linear-gradient(135deg,var(--shd-spectral-film-cyan),transparent 42%),linear-gradient(315deg,var(--shd-spectral-film-purple),transparent 58%),var(--shd-surface-raised-soft);box-shadow:inset 0 1px 0 var(--shd-spectral-highlight);color:var(--shd-content-primary)}
.shd-spectral-glass{background:linear-gradient(135deg,var(--shd-spectral-film-cyan),transparent 44%),linear-gradient(315deg,var(--shd-spectral-film-purple),transparent 62%),var(--shd-surface-glass);backdrop-filter:blur(14px) saturate(118%);-webkit-backdrop-filter:blur(14px) saturate(118%);box-shadow:inset 0 1px 0 var(--shd-spectral-highlight);color:var(--shd-content-primary)}
.shd-surface-inset{background:var(--shd-surface-inset);box-shadow:inset 0 1px 0 rgba(255,255,255,.018);color:var(--shd-content-primary)}
.shd-local-focus:focus-visible{outline:2px solid var(--shd-focus-ring);outline-offset:-2px}
.shd-local-active{background-color:var(--shd-accent-primary-softer);box-shadow:inset 2px 0 0 var(--shd-stroke-accent)}
.shd-control-focus:focus-visible,.shd-focus-frame{outline:2px solid var(--shd-focus-ring);outline-offset:1px}
.peer:focus-visible+.shd-peer-control-focus{outline:2px solid var(--shd-focus-ring);outline-offset:1px}
`,
    }],
    theme: {
      colors,
      fontFamily: {
        mono: 'JetBrains Mono, Fira Code, monospace',
        sans: 'Inter, -apple-system, sans-serif',
      },
    },
    shortcuts,
    safelist,
  }
}
