import { createRoot } from 'react-dom/client'
import { ThemeProvider, type ThemeOverride } from '../../../src/theme'
import '../../../src/styles/base.css'

type Colors = { accent: string; stroke: string; focus: string }

function readColors(): Colors {
  const probe = document.getElementById('theme-probe')!
  const style = getComputedStyle(probe)
  return { accent: style.color, stroke: style.borderTopColor, focus: style.outlineColor }
}

function Probe({ theme }: { theme?: ThemeOverride }) {
  return (
    <ThemeProvider theme={theme}>
      <div id="theme-probe" style={{ color: 'var(--shd-accent-primary)', borderTop: '1px solid var(--shd-stroke-accent)', outline: '1px solid var(--shd-focus-ring)' }} />
    </ThemeProvider>
  )
}

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
  root.render(<Probe />)
  await waitForVariables({ '--shd-holo-cyan': '#00ffff' })
  const defaults = readColors()

  root.render(<Probe theme={{ colors: { 'holo-cyan': '#ff6b35' } }} />)
  await waitForVariables({ '--shd-holo-cyan': '#ff6b35' })
  const primitive = readColors()
  if (primitive.accent === defaults.accent || primitive.stroke === defaults.stroke || primitive.focus === defaults.focus) throw new Error(`Primitive override did not change all derived roles: ${JSON.stringify({ defaults, primitive })}`)

  root.render(<Probe theme={{ colors: { 'holo-cyan': '#ff6b35' }, semanticColors: { 'accent-primary': 'rgb(255, 170, 0)', 'stroke-accent': 'rgb(204, 119, 0)', 'focus-ring': 'rgb(255, 255, 255)' } }} />)
  await waitForVariables({ '--shd-accent-primary': 'rgb(255, 170, 0)', '--shd-stroke-accent': 'rgb(204, 119, 0)', '--shd-focus-ring': 'rgb(255, 255, 255)' })
  const semantic = readColors()
  const expectedSemantic = { accent: 'rgb(255, 170, 0)', stroke: 'rgb(204, 119, 0)', focus: 'rgb(255, 255, 255)' }
  if (JSON.stringify(semantic) !== JSON.stringify(expectedSemantic)) throw new Error(`Semantic override did not win: ${JSON.stringify({ expectedSemantic, semantic })}`)

  root.render(<Probe theme={{ colors: { 'holo-cyan': '#33ddff' } }} />)
  await waitForVariables({ '--shd-holo-cyan': '#33ddff', '--shd-accent-primary': '', '--shd-stroke-accent': '', '--shd-focus-ring': '' })
  const restored = readColors()
  if (restored.accent === semantic.accent || restored.stroke === semantic.stroke || restored.focus === semantic.focus) throw new Error(`Removing semantic overrides did not restore primitive derivation: ${JSON.stringify({ semantic, restored })}`)
  if (restored.accent === defaults.accent && restored.stroke === defaults.stroke && restored.focus === defaults.focus) throw new Error(`Restored roles ignored the current primitive override: ${JSON.stringify({ defaults, restored })}`)

  document.body.dataset.themeContract = 'pass'
  document.body.textContent = JSON.stringify({ defaults, primitive, semantic, restored })
})().catch(error => {
  document.body.dataset.themeContract = 'fail'
  document.body.textContent = error instanceof Error ? error.stack ?? error.message : String(error)
})
