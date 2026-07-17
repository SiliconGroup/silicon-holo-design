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
.shd-spectral-panel{background:var(--shd-surface-base-soft);box-shadow:inset 0 1px 0 var(--shd-spectral-highlight);color:var(--shd-content-primary)}
.shd-spectral-panel-raised{background:var(--shd-surface-raised-soft);box-shadow:inset 0 1px 0 var(--shd-spectral-highlight);color:var(--shd-content-primary)}
.shd-spectral-glass{background:var(--shd-surface-glass);backdrop-filter:blur(14px) saturate(118%);-webkit-backdrop-filter:blur(14px) saturate(118%);box-shadow:inset 0 1px 0 var(--shd-spectral-highlight);color:var(--shd-content-primary)}
.shd-surface-inset{background:var(--shd-surface-inset);box-shadow:inset 0 1px 0 rgba(255,255,255,.018);color:var(--shd-content-primary)}
.shd-status-glass{--shd-state-color:var(--shd-content-tertiary);--shd-state-film:3%;background:color-mix(in srgb,var(--shd-surface-glass) calc(100% - var(--shd-state-film)),var(--shd-state-color) var(--shd-state-film));backdrop-filter:blur(16px) saturate(122%);-webkit-backdrop-filter:blur(16px) saturate(122%);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--shd-state-color) 12%,var(--shd-spectral-highlight)),0 14px 36px rgba(0,0,0,.16);color:var(--shd-content-primary)}
.shd-status-glass[data-shd-state=running],.shd-status-glass-item[data-shd-state=running]{--shd-state-color:var(--shd-accent-primary);--shd-state-film:8%}
.shd-status-glass[data-shd-state=complete],.shd-status-glass[data-shd-state=completed],.shd-status-glass-item[data-shd-state=complete],.shd-status-glass-item[data-shd-state=completed]{--shd-state-color:var(--shd-status-success);--shd-state-film:9%}
.shd-status-glass[data-shd-state=blocked],.shd-status-glass[data-shd-state=warning],.shd-status-glass-item[data-shd-state=blocked],.shd-status-glass-item[data-shd-state=warning]{--shd-state-color:var(--shd-status-warning);--shd-state-film:10%}
.shd-status-glass[data-shd-state=error],.shd-status-glass-item[data-shd-state=error]{--shd-state-color:var(--shd-status-error);--shd-state-film:10%}
.shd-status-glass-header{background:color-mix(in srgb,var(--shd-surface-raised-soft) 90%,var(--shd-state-color) 10%);box-shadow:inset 0 -1px 0 color-mix(in srgb,var(--shd-state-color) 8%,transparent)}
.shd-status-glass-header:hover,.shd-status-glass[data-shd-open=true]>.shd-status-glass-header{background:color-mix(in srgb,var(--shd-surface-interactive-hover) 87%,var(--shd-state-color) 13%)}
.shd-status-glass-body{background:color-mix(in srgb,var(--shd-surface-inset) 92%,var(--shd-state-color) 8%);backdrop-filter:blur(12px) saturate(116%);-webkit-backdrop-filter:blur(12px) saturate(116%);box-shadow:inset 0 1px 0 rgba(255,255,255,.018);color:var(--shd-content-primary)}
.shd-status-glass-item{--shd-state-color:var(--shd-content-tertiary);--shd-state-film:7%;background:color-mix(in srgb,var(--shd-surface-glass) calc(100% - var(--shd-state-film)),var(--shd-state-color) var(--shd-state-film));backdrop-filter:blur(10px) saturate(118%);-webkit-backdrop-filter:blur(10px) saturate(118%);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--shd-state-color) 9%,rgba(255,255,255,.025)),0 6px 18px rgba(0,0,0,.08)}
.shd-status-glass-inset{background:color-mix(in srgb,var(--shd-surface-inset) 95%,var(--shd-state-color) 5%);box-shadow:inset 0 1px 0 rgba(255,255,255,.018);color:var(--shd-content-primary)}
.shd-status-text{color:var(--shd-state-color)}
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
