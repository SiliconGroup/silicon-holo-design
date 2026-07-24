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
.border{border-style:solid}
.border-x{border-style:solid;border-width:0 1px}
.border-y{border-style:solid;border-width:1px 0}
.border-t{border-style:solid;border-width:1px 0 0}
.border-r{border-style:solid;border-width:0 1px 0 0}
.border-b{border-style:solid;border-width:0 0 1px}
.border-l{border-style:solid;border-width:0 0 0 1px}
.border-l-2{border-style:solid;border-width:0 0 0 2px}
button.shd-control-focus,button.shd-local-focus{appearance:none;font:inherit}
button.shd-local-focus{background-color:transparent;color:inherit}
.shd-z-dropdown{z-index:var(--shd-z-dropdown,40)}
.shd-z-overlay{z-index:var(--shd-z-overlay,50)}
.shd-z-nested-overlay{z-index:var(--shd-z-nested-overlay,60)}
.shd-z-toast{z-index:var(--shd-z-toast,70)}
.shd-z-tooltip{z-index:var(--shd-z-tooltip,80)}
.shd-overlay-header{border:0 solid var(--shd-stroke-subtle);border-bottom-width:1px}
.shd-overlay-footer{border:0 solid var(--shd-stroke-subtle);border-top-width:1px}
.shd-drawer-edge-left{border:0 solid var(--shd-stroke-default);border-left-width:1px}
.shd-drawer-edge-right{border:0 solid var(--shd-stroke-default);border-right-width:1px}
.shd-accent-border{border:1px solid var(--shd-stroke-subtle);border-left-width:3px}
button.shd-button{box-sizing:border-box;min-width:0;font-family:var(--shd-font-sans,Inter,"SF Pro Text","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC","Noto Sans SC",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);font-weight:500;line-height:1;letter-spacing:.005em;white-space:nowrap}
button.shd-button-sm{height:32px;gap:6px;padding:0 12px;font-size:13px}
button.shd-button-md{height:36px;gap:8px;padding:0 16px;font-size:14px}
button.shd-button-lg{height:40px;gap:8px;padding:0 20px;font-size:15px}
button.shd-segmented-control-button{font-family:var(--shd-font-sans,Inter,"SF Pro Text","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC","Noto Sans SC",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);font-size:12px;font-weight:500;line-height:1;letter-spacing:.005em}
.shd-copy-action{box-sizing:border-box;display:inline-flex;width:26px;height:26px;flex:0 0 auto;cursor:pointer;align-items:center;justify-content:center;border:0;border-radius:var(--shd-radius-sm);background:transparent;padding:0;color:var(--shd-content-tertiary);transition:color 150ms,background-color 150ms}
.shd-copy-action:hover{background:var(--shd-surface-interactive);color:var(--shd-content-primary)}
.shd-copy-action svg{width:14px;height:14px}
.shd-scrollbar{scrollbar-width:thin;scrollbar-color:var(--shd-stroke-default) transparent}
@supports selector(::-webkit-scrollbar){
.shd-scrollbar{scrollbar-width:auto;scrollbar-color:auto}
.shd-scrollbar::-webkit-scrollbar{width:8px;height:8px}
.shd-scrollbar::-webkit-scrollbar-track{background:transparent}
.shd-scrollbar::-webkit-scrollbar-thumb{min-height:32px;border:2px solid transparent;border-radius:999px;background:var(--shd-stroke-default);background-clip:padding-box}
.shd-scrollbar::-webkit-scrollbar-thumb:hover{background:var(--shd-stroke-accent);background-clip:padding-box}
}
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
.shd-chat-bubble{--shd-bubble-signal:var(--shd-accent-blue);position:relative;overflow:hidden;border:1px solid var(--shd-stroke-subtle);background:color-mix(in srgb,var(--shd-surface-glass) 95%,var(--shd-bubble-signal) 5%);backdrop-filter:blur(14px) saturate(116%);-webkit-backdrop-filter:blur(14px) saturate(116%);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--shd-bubble-signal) 10%,rgba(255,255,255,.025)),0 10px 28px rgba(0,0,0,.12)}
.shd-chat-bubble-assistant{--shd-bubble-signal:var(--shd-accent-blue);border-left:2px solid color-mix(in srgb,var(--shd-bubble-signal) 58%,transparent)}
.shd-chat-bubble-user{--shd-bubble-signal:var(--shd-accent-primary);border-color:color-mix(in srgb,var(--shd-bubble-signal) 34%,var(--shd-stroke-subtle));border-right:2px solid color-mix(in srgb,var(--shd-bubble-signal) 72%,transparent);background:color-mix(in srgb,var(--shd-surface-glass) 88%,var(--shd-bubble-signal) 12%)}
.shd-chat-bubble-assistant[data-shd-state=running]{border-color:color-mix(in srgb,var(--shd-bubble-signal) 42%,var(--shd-stroke-subtle))}
.shd-chat-bubble-meta{border-top:1px solid color-mix(in srgb,var(--shd-bubble-signal) 8%,var(--shd-stroke-muted))}
.shd-chat-bubble-content{padding:14px 18px}
.shd-markdown-code-block{background:color-mix(in srgb,var(--shd-surface-inset) 97%,var(--shd-accent-blue) 3%);box-shadow:inset 0 1px 0 rgba(255,255,255,.018)}
.shd-markdown-code-toolbar{background:color-mix(in srgb,var(--shd-surface-base) 96%,var(--shd-accent-blue) 4%)}
[data-shd-inline-code=true]{border-radius:3px;background:var(--shd-accent-primary-softer);padding:.08em .35em;color:var(--shd-content-accent);font-family:var(--shd-font-mono,"JetBrains Mono","Fira Code",monospace);font-size:.9em}
.shd-markdown-content{min-width:0;font-family:var(--shd-font-sans,Inter,"SF Pro Text","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC","Noto Sans SC",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);font-size:.9375rem;line-height:1.65;letter-spacing:.002em;color:var(--shd-content-secondary);overflow-wrap:break-word;word-break:normal}
.shd-markdown-content>:first-child{margin-top:0}
.shd-markdown-content>:last-child{margin-bottom:0}
.shd-markdown-content>:where(p,h1,h2,h3,h4,ul,ol,blockquote,hr){max-width:72ch}
.shd-markdown-content.shd-markdown-doc{width:100%;max-width:min(100%,52rem);margin-inline:auto}
.shd-markdown-content.shd-markdown-doc>:where(p,h1,h2,h3,h4,ul,ol,blockquote,hr){max-width:none}
.shd-markdown-content p{margin:0}
.shd-markdown-content p+p{margin-top:.72em}
.shd-markdown-content h1,.shd-markdown-content h2,.shd-markdown-content h3,.shd-markdown-content h4{margin:1.2em 0 .52em;color:var(--shd-content-primary);font-weight:600;line-height:1.4;letter-spacing:-.008em}
.shd-markdown-content h1{font-size:1.32em}
.shd-markdown-content h2{font-size:1.18em}
.shd-markdown-content h3{font-size:1.06em}
.shd-markdown-content h4{font-size:1em}
.shd-markdown-content strong{color:inherit;font-weight:600}
.shd-markdown-content ul,.shd-markdown-content ol{margin:.68em 0 .78em;padding-left:1.45em}
.shd-markdown-content li{padding-left:.12em}
.shd-markdown-content li+li{margin-top:.16em}
.shd-markdown-content hr{margin:1.2em 0;border:0;border-top:1px solid var(--shd-stroke-subtle)}
.shd-markdown-content code{background:var(--shd-accent-primary-softer);border:1px solid var(--shd-stroke-subtle);border-radius:var(--shd-radius-sm);padding:2px 6px;font-family:var(--shd-font-mono,"JetBrains Mono","Fira Code",monospace);color:var(--shd-content-accent);font-size:.9em}
.shd-markdown-content pre{background:var(--shd-surface-base);border:1px solid var(--shd-stroke-subtle);border-radius:var(--shd-radius-md);padding:16px;overflow-x:auto}
.shd-markdown-content a{color:var(--shd-content-accent);text-decoration:none;border-bottom:1px solid var(--shd-stroke-accent);overflow-wrap:anywhere;word-break:break-word}
.shd-markdown-content a:hover{color:var(--shd-accent-primary-hover);border-bottom-color:var(--shd-stroke-accent-strong)}
.shd-markdown-content blockquote{border-left:2px solid var(--shd-stroke-accent);background:var(--shd-accent-primary-softer);padding:10px 14px;margin:1em 0;color:var(--shd-content-secondary)}
.shd-markdown-content blockquote>:first-child{margin-top:0}
.shd-markdown-content blockquote>:last-child{margin-bottom:0}
.shd-markdown-content li::marker{color:var(--shd-content-accent)}
.shd-markdown-content table{width:100%;border-collapse:collapse;margin:1em 0;font-size:.9em}
.shd-markdown-table-wrap{max-width:100%;margin:1em 0;overflow-x:auto}
.shd-markdown-table-wrap table{width:max-content;min-width:100%;margin:0}
.shd-markdown-content th{background:var(--shd-surface-raised);border:1px solid var(--shd-stroke-subtle);padding:8px 12px;text-align:left;font-weight:600;color:var(--shd-content-primary);font-family:var(--shd-font-mono,"JetBrains Mono","Fira Code",monospace);font-size:.85em}
.shd-markdown-content td{border:1px solid var(--shd-stroke-muted);padding:8px 12px;color:var(--shd-content-secondary)}
.shd-markdown-content tr:hover td{background:var(--shd-accent-primary-softer)}
.shd-markdown-content img,.shd-markdown-content video{max-width:100%;height:auto}
.shd-markdown-content code[data-shd-inline-code=true]{white-space:normal;overflow-wrap:anywhere;word-break:break-word}
.shd-markdown-code-block .hljs{display:inline;overflow:visible;padding:0;background:transparent;color:var(--shd-content-secondary)}
.shd-markdown-code-block .hljs-comment,.shd-markdown-code-block .hljs-quote{color:var(--shd-content-tertiary)}
.shd-markdown-code-block .hljs-keyword,.shd-markdown-code-block .hljs-doctag,.shd-markdown-code-block .hljs-formula{color:var(--shd-accent-purple)}
.shd-markdown-code-block .hljs-string,.shd-markdown-code-block .hljs-regexp,.shd-markdown-code-block .hljs-addition{color:color-mix(in srgb,var(--shd-status-success) 64%,var(--shd-content-secondary))}
.shd-markdown-code-block .hljs-number,.shd-markdown-code-block .hljs-literal,.shd-markdown-code-block .hljs-attr,.shd-markdown-code-block .hljs-variable{color:color-mix(in srgb,var(--shd-status-warning) 68%,var(--shd-content-secondary))}
.shd-markdown-code-block .hljs-title,.shd-markdown-code-block .hljs-type,.shd-markdown-code-block .hljs-built_in,.shd-markdown-code-block .hljs-symbol{color:var(--shd-accent-blue)}
.shd-markdown-code-block .hljs-attribute,.shd-markdown-code-block .hljs-property{color:var(--shd-content-accent)}
.shd-markdown-content .shd-markdown-code-block pre,.shd-markdown-content .shd-markdown-code-block code{margin:0;border:0;border-radius:0;background:transparent;padding:0}
.shd-markdown-content .shd-markdown-code-block pre{overflow-x:auto;padding:14px}
.shd-markdown-content .katex{color:var(--shd-content-primary)}
.shd-markdown-content .katex-display{margin:1em 0;overflow-x:auto;overflow-y:hidden;padding-bottom:4px;scrollbar-width:thin;scrollbar-color:var(--shd-stroke-default) transparent}
@supports selector(::-webkit-scrollbar){
.shd-markdown-content .katex-display{scrollbar-width:auto;scrollbar-color:auto}
.shd-markdown-content .katex-display::-webkit-scrollbar{width:8px;height:8px}
.shd-markdown-content .katex-display::-webkit-scrollbar-track{background:transparent}
.shd-markdown-content .katex-display::-webkit-scrollbar-thumb{border:2px solid transparent;border-radius:999px;background:var(--shd-stroke-default);background-clip:padding-box}
.shd-markdown-content .katex-display::-webkit-scrollbar-thumb:hover{background:var(--shd-stroke-accent);background-clip:padding-box}
}
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
        sans: 'var(--shd-font-sans, Inter, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
      },
    },
    shortcuts,
    safelist,
  }
}
