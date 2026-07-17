import { createRoot } from 'react-dom/client'
import { ThemeProvider, type ThemeOverride } from '../../../src/theme'
import '../../../src/styles/base.css'

type Colors = { accent: string; stroke: string; focus: string; raised: string; overlay: string; interactive: string; selected: string; foreground: string }

function readColors(): Colors {
  const probe = document.getElementById('theme-probe')!
  const style = getComputedStyle(probe)
  return {
    accent: style.color,
    stroke: style.borderTopColor,
    focus: style.outlineColor,
    raised: style.backgroundColor,
    overlay: getComputedStyle(document.getElementById('theme-overlay')!).backgroundColor,
    interactive: getComputedStyle(document.getElementById('theme-interactive')!).backgroundColor,
    selected: getComputedStyle(document.getElementById('theme-selected')!).backgroundColor,
    foreground: getComputedStyle(document.getElementById('theme-foreground')!).color,
  }
}

function ThemeProbes() {
  return <>
    <div id="theme-probe" style={{ color: 'var(--shd-accent-primary)', borderTop: '1px solid var(--shd-stroke-accent)', outline: '1px solid var(--shd-focus-ring)', backgroundColor: 'var(--shd-surface-raised)' }} />
    <div id="theme-overlay" style={{ backgroundColor: 'var(--shd-surface-overlay)' }} />
    <div id="theme-interactive" style={{ backgroundColor: 'var(--shd-surface-interactive)' }} />
    <div id="theme-selected" style={{ backgroundColor: 'var(--shd-surface-selected)' }} />
    <div id="theme-foreground" style={{ color: 'var(--shd-content-primary)' }} />
  </>
}

function Probe({ theme }: { theme?: ThemeOverride }) {
  return (
    <ThemeProvider theme={theme}>
      <ThemeProbes />
    </ThemeProvider>
  )
}

function BareProbe() { return <ThemeProbes /> }

async function waitForVariables(expected: Record<string, string>) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const style = document.documentElement.style
    if (Object.entries(expected).every(([name, value]) => style.getPropertyValue(name).trim() === value)) return
    await new Promise<void>(resolve => window.setTimeout(resolve, 10))
  }
  throw new Error(`Timed out waiting for variables: ${JSON.stringify(expected)}`)
}

const root = createRoot(document.getElementById('root')!)

void (async () => {
  root.render(<BareProbe />)
  await new Promise<void>(resolve => window.setTimeout(resolve, 30))
  const withoutProvider = readColors()

  root.render(<Probe />)
  await waitForVariables({ '--shd-holo-cyan': '#00ffff' })
  const defaults = readColors()
  if (JSON.stringify(defaults) !== JSON.stringify(withoutProvider)) throw new Error(`An empty ThemeProvider changed default computed colors: ${JSON.stringify({ withoutProvider, defaults })}`)

  root.render(<Probe theme={{ colors: { 'holo-cyan': '#ff6b35' } }} />)
  await waitForVariables({ '--shd-holo-cyan': '#ff6b35' })
  const primitive = readColors()
  if (primitive.accent === defaults.accent || primitive.stroke === defaults.stroke || primitive.focus === defaults.focus) throw new Error(`Primitive override did not change all derived roles: ${JSON.stringify({ defaults, primitive })}`)

  root.render(<Probe theme={{ colors: { 'holo-cyan': '#ff6b35' }, semanticColors: { 'accent-primary': 'rgb(255, 170, 0)', 'stroke-accent': 'rgb(204, 119, 0)', 'focus-ring': 'rgb(255, 255, 255)' } }} />)
  await waitForVariables({ '--shd-accent-primary': 'rgb(255, 170, 0)', '--shd-stroke-accent': 'rgb(204, 119, 0)', '--shd-focus-ring': 'rgb(255, 255, 255)' })
  const semantic = readColors()
  const expectedSemantic = { accent: 'rgb(255, 170, 0)', stroke: 'rgb(204, 119, 0)', focus: 'rgb(255, 255, 255)' }
  const semanticOverrides = { accent: semantic.accent, stroke: semantic.stroke, focus: semantic.focus }
  if (JSON.stringify(semanticOverrides) !== JSON.stringify(expectedSemantic)) throw new Error(`Semantic override did not win: ${JSON.stringify({ expectedSemantic, semantic })}`)

  root.render(<Probe theme={{ colors: { 'holo-cyan': '#33ddff' } }} />)
  await waitForVariables({ '--shd-holo-cyan': '#33ddff' })
  const restored = readColors()
  if (restored.accent === semantic.accent || restored.stroke === semantic.stroke || restored.focus === semantic.focus) throw new Error(`Removing semantic overrides did not restore primitive derivation: ${JSON.stringify({ semantic, restored })}`)
  if (restored.accent === defaults.accent && restored.stroke === defaults.stroke && restored.focus === defaults.focus) throw new Error(`Restored roles ignored the current primitive override: ${JSON.stringify({ defaults, restored })}`)

  document.body.dataset.themeContract = 'pass'
  document.body.textContent = JSON.stringify({ defaults, primitive, semantic, restored })
})().catch(error => {
  document.body.dataset.themeContract = 'fail'
  document.body.textContent = error instanceof Error ? error.stack ?? error.message : String(error)
})
