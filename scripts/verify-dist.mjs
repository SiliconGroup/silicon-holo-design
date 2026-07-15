import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve(import.meta.dirname, '../dist/silicon-holo-design.css'), 'utf8')
const required = [
  '--shd-surface-base:',
  '.bg-surface-base{',
  '.bg-surface-raised{',
  '.bg-accent-primary-soft{',
  '.bg-state-success-soft{',
  '.border-stroke-default{',
  '.border-stroke-accent{',
]

const missing = required.filter(value => !css.includes(value))
if (missing.length > 0) {
  console.error(`Missing required dist CSS selectors: ${missing.join(', ')}`)
  process.exit(1)
}

if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(css)) {
  console.error('Missing scoped reduced-motion media query')
  process.exit(1)
}

if (!/\[data-shd-motion\]\s*\*/.test(css)) {
  console.error('Reduced-motion rules must disable animated descendants inside opted-in components')
  process.exit(1)
}

if (!/\*,:{1,2}before,:{1,2}after\{[^}]*border-width:0[^}]*border-style:solid/.test(css)) {
  console.error('Dist CSS must include the self-contained UnoCSS border preflight')
  process.exit(1)
}

if (!/button\{[^}]*appearance:none[^}]*border-width:0/.test(css)) {
  console.error('Dist CSS must remove native button borders')
  process.exit(1)
}

if (/\*(?:,\*:{1,2}before,\*:{1,2}after)?\{[^}]*scroll-behavior:auto!important/.test(css)) {
  console.error('Reduced-motion rules must not affect every element in the host application')
  process.exit(1)
}

console.log('✓ dist CSS contains semantic utilities and scoped reduced-motion rules')
