import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { globSync } from 'glob'

const root = resolve(import.meta.dirname, '..')
const files = globSync('src/**/*.{ts,tsx}', {
  cwd: root,
  absolute: true,
  ignore: ['**/*.test.{ts,tsx}', '**/preset/safelist.ts'],
})
const pattern = /(bg|text|via|from|to|ring|border(?:-[trblxy])?)-(surface|content|stroke|accent|state|status|focus)[^\s'"`}]*\/\d+/g
const violations = files.flatMap(file => (readFileSync(file, 'utf8').match(pattern) ?? []).map(match => `${file.replace(`${root}/`, '')}: ${match}`))
const obsoleteMotionAttributes = files.flatMap(file => readFileSync(file, 'utf8').includes('data-shd-decorative-motion') ? [file.replace(`${root}/`, '')] : [])
const unsupportedMotion = files.flatMap(file => {
  const source = readFileSync(file, 'utf8')
  const issues = []
  if (source.includes('<animate')) issues.push('SVG SMIL <animate>')
  if (/behavior\s*:\s*['"]smooth['"]/.test(source)) issues.push('forced smooth scrolling')
  return issues.map(issue => `${file.replace(`${root}/`, '')}: ${issue}`)
})
const baseCss = readFileSync(resolve(root, 'src/styles/base.css'), 'utf8')
const semanticDerivations = [
  ['accent-primary', /--shd-accent-primary:\s*color-mix\([^;]*var\(--shd-holo-cyan\)[^;]*var\(--shd-holo-blue\)/],
  ['stroke-accent', /--shd-stroke-accent:\s*color-mix\([^;]*var\(--shd-holo-cyan\)/],
  ['focus-ring', /--shd-focus-ring:\s*color-mix\([^;]*var\(--shd-holo-cyan\)/],
]
const missingSemanticDerivations = semanticDerivations
  .filter(([, expression]) => !expression.test(baseCss))
  .map(([name]) => name)
const baseResetIssues = []
if (!/\*,\s*::before,\s*::after\s*\{[^}]*border-width:\s*0[^}]*border-style:\s*solid/.test(baseCss)) baseResetIssues.push('missing solid zero-width border preflight')
if (/button\s*\{[^}]*border\s*:\s*(?:0|none)/.test(baseCss)) baseResetIssues.push('button reset uses a border shorthand that disables utility borders')
if (!/button\s*\{[^}]*appearance:\s*none[^}]*border-width:\s*0/.test(baseCss)) baseResetIssues.push('button reset does not remove native borders safely')

if (violations.length > 0) {
  console.error(`Semantic CSS-variable colors cannot use alpha modifiers:\n${violations.join('\n')}`)
  process.exit(1)
}

if (obsoleteMotionAttributes.length > 0) {
  console.error(`Decorative animations must use data-shd-motion so reduced motion can reach descendants:\n${obsoleteMotionAttributes.join('\n')}`)
  process.exit(1)
}

if (unsupportedMotion.length > 0) {
  console.error(`Motion must be controllable by the shared reduced-motion contract:\n${unsupportedMotion.join('\n')}`)
  process.exit(1)
}

if (missingSemanticDerivations.length > 0) {
  console.error(`Semantic roles must remain derived from final primitive variables: ${missingSemanticDerivations.join(', ')}`)
  process.exit(1)
}

if (baseResetIssues.length > 0) {
  console.error(`Base reset is incompatible with UnoCSS border utilities: ${baseResetIssues.join(', ')}`)
  process.exit(1)
}

console.log('✓ semantic CSS-variable utilities do not use alpha modifiers')
console.log('✓ decorative animations use the shared reduced-motion contract')
console.log('✓ accent, stroke, and focus roles derive from final primitive variables')
console.log('✓ base reset preserves UnoCSS design borders without native control frames')
