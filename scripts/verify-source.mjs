import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { globSync } from 'glob'

const root = resolve(import.meta.dirname, '..')
const files = globSync('src/**/*.{ts,tsx}', {
  cwd: root,
  absolute: true,
  ignore: ['**/*.test.{ts,tsx}', '**/preset/safelist.ts'],
})
const demoFiles = globSync('{showcases,examples}/**/*.{ts,tsx}', { cwd: root, absolute: true })
const pattern = /(bg|text|via|from|to|ring|border(?:-[trblxy])?)-(surface|content|stroke|accent|state|status|focus)[^\s'"`}]*\/\d+/g
const violations = files.flatMap(file => (readFileSync(file, 'utf8').match(pattern) ?? []).map(match => `${file.replace(`${root}/`, '')}: ${match}`))
const primitiveUtilityPattern = /(?:bg|text|border|ring)-(?:holo|scene)-[^\s'"`}]+/g
const primitiveUtilityViolations = files.flatMap(file => (readFileSync(file, 'utf8').match(primitiveUtilityPattern) ?? []).map(match => `${file.replace(`${root}/`, '')}: ${match}`))
const obsoleteMotionAttributes = files.flatMap(file => readFileSync(file, 'utf8').includes('data-shd-decorative-motion') ? [file.replace(`${root}/`, '')] : [])
const unsupportedMotion = files.flatMap(file => {
  const source = readFileSync(file, 'utf8')
  const issues = []
  if (source.includes('<animate')) issues.push('SVG SMIL <animate>')
  if (/behavior\s*:\s*['"]smooth['"]/.test(source)) issues.push('forced smooth scrolling')
  return issues.map(issue => `${file.replace(`${root}/`, '')}: ${issue}`)
})
const baseCss = readFileSync(resolve(root, 'src/styles/base.css'), 'utf8')
const presetSource = readFileSync(resolve(root, 'src/preset/index.ts'), 'utf8')
const safelistExtractor = readFileSync(resolve(root, 'scripts/extract-safelist.mjs'), 'utf8')
const semanticDerivations = [
  ['accent-primary', /--shd-accent-primary:\s*color-mix\([^;]*var\(--shd-holo-cyan\)[^;]*var\(--shd-holo-blue\)/],
  ['stroke-accent', /--shd-stroke-accent:\s*color-mix\([^;]*var\(--shd-holo-cyan\)/],
  ['focus-ring', /--shd-focus-ring:\s*color-mix\([^;]*var\(--shd-holo-cyan\)/],
]
const missingSemanticDerivations = semanticDerivations
  .filter(([, expression]) => !expression.test(baseCss))
  .map(([name]) => name)
const baseResetIssues = []
const nativeButtonBackgroundIssues = files.flatMap(file => {
  const source = readFileSync(file, 'utf8')
  return source.split('\n').flatMap((line, index) => line.includes('shd-control-focus') && line.includes('border-none') && !line.includes('bg-transparent')
    ? [`${file.replace(`${root}/`, '')}:${index + 1}`]
    : [])
})
const unthemedScrollSurfaces = [...files, ...demoFiles].flatMap(file => {
  const source = readFileSync(file, 'utf8')
  return source.split('\n').flatMap((line, index) => /overflow(?:-[xy])?-(?:auto|scroll)/.test(line) && !line.includes('shd-scrollbar') && !line.includes('chat-input-scrollbar')
    ? [`${file.replace(`${root}/`, '')}:${index + 1}: ${line.trim()}`]
    : [])
})
const nakedDemoBorders = demoFiles.flatMap(file => {
  const source = readFileSync(file, 'utf8')
  return Array.from(source.matchAll(/className=(?:"([^"]*)"|'([^']*)')/g)).flatMap(match => {
    const value = match[1] ?? match[2] ?? ''
    const classes = value.split(/\s+/)
    const hasBareBorder = classes.some(token => token === 'border' || /^border-[trblxy]$/.test(token))
    const hasSemanticBorder = classes.some(token => /^border-(?:stroke|status|spectral|transparent|none)/.test(token))
    return hasBareBorder && !hasSemanticBorder ? [`${file.replace(`${root}/`, '')}: ${value}`] : []
  })
})
if (!/\.border[^\{]*\{[^}]*border-style:\s*solid/.test(baseCss)) baseResetIssues.push('border utilities do not establish a visible border style')
if (!/button\.shd-control-focus[^\{]*\{[^}]*appearance:\s*none/.test(baseCss)) baseResetIssues.push('library buttons do not remove native appearance')
if (/(?:^|\n)\s*body\s*\{/.test(baseCss)) baseResetIssues.push('base styles must not force host body styles')
if (/(?:^|\n)\s*button\s*\{/.test(baseCss)) baseResetIssues.push('base styles must not reset every host button')
if (/(?:^|\n)\s*input\s*,\s*textarea\s*,\s*select\s*\{/.test(baseCss)) baseResetIssues.push('base styles must not reset every host form control')
const materialContractIssues = []
const scriptPortabilityIssues = []
if (!/pathToFileURL\(join\(distDir, ['"]preset['"], ['"]index\.js['"]\)\)/.test(safelistExtractor)) scriptPortabilityIssues.push('safelist preset import must convert the filesystem path to a file URL')
if (/await import\(join\(/.test(safelistExtractor)) scriptPortabilityIssues.push('safelist extractor must not pass an absolute filesystem path directly to ESM import')
const scrollbarContractIssues = []
for (const [name, source] of [['base CSS', baseCss], ['preset', presetSource]]) {
  if (!/\.shd-scrollbar\s*\{[^}]*scrollbar-width:\s*thin;?[^}]*scrollbar-color:\s*var\(--shd-stroke-default\) transparent/s.test(source)) scrollbarContractIssues.push(`${name} lacks the standard scrollbar baseline`)
  if (!/\.shd-markdown-content \.katex-display\s*\{[^}]*scrollbar-width:\s*thin;?[^}]*scrollbar-color:\s*var\(--shd-stroke-default\) transparent/s.test(source)) scrollbarContractIssues.push(`${name} lacks the standard KaTeX scrollbar baseline`)
  if (!/@supports selector\(::-webkit-scrollbar\)\s*\{\s*\.shd-scrollbar\s*\{[^}]*scrollbar-width:\s*auto;?[^}]*scrollbar-color:\s*auto;?[^}]*\}\s*\.shd-scrollbar::-webkit-scrollbar/s.test(source)) scrollbarContractIssues.push(`${name} does not isolate the WebKit scrollbar strategy`)
  if (!/@supports selector\(::-webkit-scrollbar\)\s*\{\s*\.shd-markdown-content \.katex-display\s*\{[^}]*scrollbar-width:\s*auto;?[^}]*scrollbar-color:\s*auto;?[^}]*\}\s*\.shd-markdown-content \.katex-display::-webkit-scrollbar/s.test(source)) scrollbarContractIssues.push(`${name} does not isolate the WebKit KaTeX strategy`)
}
for (const selector of ['shd-spectral-panel', 'shd-spectral-panel-raised', 'shd-spectral-glass', 'shd-surface-inset']) {
  const baseRule = new RegExp(`\\.${selector}\\s*\\{[^}]*color:\\s*var\\(--shd-content-primary\\)`, 's')
  const presetRule = new RegExp(`\\.${selector}\\{[^}]*color:var\\(--shd-content-primary\\)`, 's')
  if (!baseRule.test(baseCss)) materialContractIssues.push(`base CSS ${selector} lacks semantic foreground`)
  if (!presetRule.test(presetSource)) materialContractIssues.push(`preset ${selector} lacks semantic foreground`)
  const baseMaterial = baseCss.match(new RegExp(`\\.${selector}\\s*\\{[^}]*\\}`, 's'))?.[0] ?? ''
  const presetMaterial = presetSource.match(new RegExp(`\\.${selector}\\{[^}]*\\}`, 's'))?.[0] ?? ''
  if (baseMaterial.includes('gradient(')) materialContractIssues.push(`base CSS ${selector} must remain flat and gradient-free`)
  if (presetMaterial.includes('gradient(')) materialContractIssues.push(`preset ${selector} must remain flat and gradient-free`)
}
for (const selector of ['shd-chat-bubble', 'shd-chat-bubble-assistant', 'shd-chat-bubble-user']) {
  const baseMaterial = baseCss.match(new RegExp(`\\.${selector}(?::before)?\\s*\\{[^}]*\\}`, 's'))?.[0] ?? ''
  const presetMaterial = presetSource.match(new RegExp(`\\.${selector}(?::before)?\\{[^}]*\\}`, 's'))?.[0] ?? ''
  if (!baseMaterial) materialContractIssues.push(`base CSS ${selector} is missing`)
  if (!presetMaterial) materialContractIssues.push(`preset ${selector} is missing`)
  if (baseMaterial.includes('gradient(')) materialContractIssues.push(`base CSS ${selector} must remain flat and gradient-free`)
  if (presetMaterial.includes('gradient(')) materialContractIssues.push(`preset ${selector} must remain flat and gradient-free`)
}
if (!/button\.shd-local-focus\{background-color:transparent;color:inherit\}/.test(presetSource)) materialContractIssues.push('preset local-focus buttons do not match the transparent inherited-color reset')
if (!/button\.shd-local-focus\s*\{[^}]*background-color:\s*transparent;[^}]*color:\s*inherit/.test(baseCss)) materialContractIssues.push('base local-focus buttons do not match the transparent inherited-color reset')

if (violations.length > 0) {
  console.error(`Semantic CSS-variable colors cannot use alpha modifiers:\n${violations.join('\n')}`)
  process.exit(1)
}

if (primitiveUtilityViolations.length > 0) {
  console.error(`Components must use semantic roles instead of primitive palette utilities:\n${primitiveUtilityViolations.join('\n')}`)
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
  console.error(`Scoped base styles violate the host isolation contract: ${baseResetIssues.join(', ')}`)
  process.exit(1)
}

if (materialContractIssues.length > 0) {
  console.error(`Preset and prebuilt material contracts diverged: ${materialContractIssues.join(', ')}`)
  process.exit(1)
}

if (nativeButtonBackgroundIssues.length > 0) {
  console.error(`Borderless library buttons must explicitly clear native backgrounds:\n${nativeButtonBackgroundIssues.join('\n')}`)
  process.exit(1)
}

if (unthemedScrollSurfaces.length > 0) {
  console.error(`Library-owned scroll surfaces must use the shared scrollbar contract:\n${unthemedScrollSurfaces.join('\n')}`)
  process.exit(1)
}

if (scrollbarContractIssues.length > 0) {
  console.error(`Scrollbar capability contracts are incomplete:\n${scrollbarContractIssues.join('\n')}`)
  process.exit(1)
}

if (scriptPortabilityIssues.length > 0) {
  console.error(`Build script portability contracts are incomplete:\n${scriptPortabilityIssues.join('\n')}`)
  process.exit(1)
}

if (nakedDemoBorders.length > 0) {
  console.error(`Showcase and example borders must declare a semantic color:\n${nakedDemoBorders.join('\n')}`)
  process.exit(1)
}

console.log('✓ semantic CSS-variable utilities do not use alpha modifiers')
console.log('✓ components depend only on semantic color roles')
console.log('✓ decorative animations use the shared reduced-motion contract')
console.log('✓ accent, stroke, and focus roles derive from final primitive variables')
console.log('✓ scoped base styles preserve design borders without resetting host controls')
console.log('✓ borderless library buttons explicitly clear native backgrounds')
console.log('✓ library-owned scroll surfaces use the shared scrollbar contract')
console.log('✓ standard and WebKit scrollbar strategies are capability-isolated')
console.log('✓ build-time ESM imports use cross-platform file URLs')
console.log('✓ preset and prebuilt material contracts remain aligned')
console.log('✓ showcase and example borders use semantic colors')
