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

if (!/\.border(?:,[^{]+)?\{[^}]*border-style:solid/.test(css)) {
  console.error('Dist CSS must make border utilities visible without a global element reset')
  process.exit(1)
}

if (!/button\.shd-control-focus(?:,[^{]+)?\{[^}]*appearance:none/.test(css)) {
  console.error('Dist CSS must remove native appearance only from library buttons')
  process.exit(1)
}

if (/(?:^|})body\{[^}]*(?:margin:0|background:var\(--shd-|color:var\(--shd-|font-family:)/.test(css)
  || /(?:^|})button\{[^}]*(?:appearance:none|border-width:0|background:none)/.test(css)
  || /(?:^|})input,textarea,select\{[^}]*(?:appearance:none|outline:none|background:none)/.test(css)) {
  console.error('Dist CSS must not reset host body or controls')
  process.exit(1)
}

if (/--un-/.test(css)) {
  console.error('Dist CSS must namespace UnoCSS runtime variables')
  process.exit(1)
}

if (/\*(?:,\*:{1,2}before,\*:{1,2}after)?\{[^}]*scroll-behavior:auto!important/.test(css)) {
  console.error('Reduced-motion rules must not affect every element in the host application')
  process.exit(1)
}

console.log('✓ dist CSS contains semantic utilities and scoped reduced-motion rules')
