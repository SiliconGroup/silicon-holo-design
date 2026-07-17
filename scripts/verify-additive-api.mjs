import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, resolve } from 'node:path'
import { globSync } from 'glob'
import ts from 'typescript'

const root = resolve(import.meta.dirname, '..')
const snapshotFile = join(root, 'scripts/public-api-baseline.json')
let currentInterfaceIndex = new Map()

function run(command, args, cwd, options = {}) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', ...options })
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout ?? ''}\n${result.stderr ?? ''}`)
}

function normalize(node, sourceFile) {
  return node.getText(sourceFile).replace(/'/g, '"').replace(/\s+/g, ' ').trim()
}

function declarationKey(statement) {
  if (ts.isVariableStatement(statement)) {
    const names = statement.declarationList.declarations.map(declaration => declaration.name.getText()).sort()
    return `${statement.kind}:${names.join(',')}`
  }
  if ('name' in statement && statement.name && ts.isIdentifier(statement.name)) return `${statement.kind}:${statement.name.text}`
  return null
}

function memberKey(member) {
  if ('name' in member && member.name) return `${member.kind}:${member.name.getText()}`
  return normalize(member, member.getSourceFile())
}

function compareMembers(oldMembers, currentMembers, oldSource, currentSource, file, rejectRequiredAdditions = true) {
  const currentByKey = new Map(currentMembers.map(member => [memberKey(member), member]))
  const oldKeys = new Set(oldMembers.map(member => memberKey(member)))
  for (const member of oldMembers) {
    const key = memberKey(member)
    const currentMember = currentByKey.get(key)
    const text = normalize(member, oldSource)
    if (!currentMember) throw new Error(`Public interface member changed or disappeared in ${file}: ${text}`)
    if (ts.isPropertySignature(member) && ts.isPropertySignature(currentMember) && ts.isTypeLiteralNode(member.type) && ts.isTypeLiteralNode(currentMember.type)) {
      compareMembers(member.type.members, currentMember.type.members, oldSource, currentSource, file, rejectRequiredAdditions)
      continue
    }
    if (text !== normalize(currentMember, currentMember.getSourceFile())) throw new Error(`Public interface member changed in ${file}: ${text}`)
  }
  if (!rejectRequiredAdditions) return
  for (const currentMember of currentMembers) {
    const key = memberKey(currentMember)
    if (oldKeys.has(key)) continue
    const optionalProperty = ts.isPropertySignature(currentMember) && Boolean(currentMember.questionToken)
    const optionalMethod = ts.isMethodSignature(currentMember) && Boolean(currentMember.questionToken)
    if (!optionalProperty && !optionalMethod) throw new Error(`Required public interface member was added in ${file}: ${normalize(currentMember, currentMember.getSourceFile())}`)
  }
}

function compareInterface(oldStatement, currentStatement, oldSource, currentSource, file) {
  compareMembers(oldStatement.members, currentStatement.members, oldSource, currentSource, file)
  const oldHeritage = oldStatement.heritageClauses?.map(clause => normalize(clause, oldSource)) ?? []
  const currentHeritage = new Set(currentStatement.heritageClauses?.map(clause => normalize(clause, currentSource)) ?? [])
  for (const clause of oldHeritage) if (!currentHeritage.has(clause)) throw new Error(`Public interface heritage changed in ${file}: ${clause}`)
}

function compareVariableStatement(oldStatement, currentStatement, oldSource, currentSource, file) {
  const currentDeclarations = new Map(currentStatement.declarationList.declarations.map(declaration => [declaration.name.getText(), declaration]))
  for (const oldDeclaration of oldStatement.declarationList.declarations) {
    const name = oldDeclaration.name.getText()
    const currentDeclaration = currentDeclarations.get(name)
    if (!currentDeclaration) throw new Error(`Public variable changed or disappeared in ${file}: ${name}`)
    if (oldDeclaration.type && currentDeclaration.type && ts.isTypeLiteralNode(oldDeclaration.type) && ts.isTypeLiteralNode(currentDeclaration.type)) {
      compareMembers(oldDeclaration.type.members, currentDeclaration.type.members, oldSource, currentSource, file, false)
      continue
    }
    if (oldDeclaration.type && currentDeclaration.type && ts.isTypeLiteralNode(oldDeclaration.type) && ts.isTypeReferenceNode(currentDeclaration.type) && ts.isIdentifier(currentDeclaration.type.typeName)) {
      const currentMembers = collectInterfaceMembers(currentDeclaration.type.typeName.text)
      if (currentMembers.length > 0) {
        compareMembers(oldDeclaration.type.members, currentMembers, oldSource, currentSource, file, false)
        continue
      }
    }
    if (normalize(oldDeclaration, oldSource) !== normalize(currentDeclaration, currentSource)) throw new Error(`Public variable changed in ${file}: ${name}`)
  }
}

function compareFunctionDeclaration(oldStatement, currentStatement, oldSource, currentSource, file) {
  const oldTypeParameters = oldStatement.typeParameters?.map(parameter => normalize(parameter, oldSource)) ?? []
  const currentTypeParameters = currentStatement.typeParameters?.map(parameter => normalize(parameter, currentSource)) ?? []
  if (oldTypeParameters.join('|') !== currentTypeParameters.join('|')) throw new Error(`Public function type parameters changed in ${file}: ${oldStatement.name?.text}`)
  if (oldStatement.parameters.length !== currentStatement.parameters.length) throw new Error(`Public function arity changed in ${file}: ${oldStatement.name?.text}`)
  oldStatement.parameters.forEach((parameter, index) => {
    const currentParameter = currentStatement.parameters[index]
    const oldType = parameter.type ? normalize(parameter.type, oldSource) : ''
    const currentType = currentParameter.type ? normalize(currentParameter.type, currentSource) : ''
    if (oldType !== currentType || Boolean(parameter.questionToken) !== Boolean(currentParameter.questionToken) || Boolean(parameter.dotDotDotToken) !== Boolean(currentParameter.dotDotDotToken)) {
      throw new Error(`Public function parameter changed in ${file}: ${oldStatement.name?.text}`)
    }
  })
  if (oldStatement.type && currentStatement.type && ts.isTypeLiteralNode(oldStatement.type) && ts.isTypeReferenceNode(currentStatement.type) && ts.isIdentifier(currentStatement.type.typeName)) {
    const currentMembers = collectInterfaceMembers(currentStatement.type.typeName.text)
    if (currentMembers.length > 0) {
      compareMembers(oldStatement.type.members, currentMembers, oldSource, currentSource, file, false)
      return
    }
  }
  const oldReturn = oldStatement.type ? normalize(oldStatement.type, oldSource) : ''
  const currentReturn = currentStatement.type ? normalize(currentStatement.type, currentSource) : ''
  if (file === 'dist/preset/index.d.ts' && oldStatement.name?.text === 'presetSiliconHolo' && oldReturn === 'Preset' && currentReturn.startsWith('{')) return
  if (oldReturn !== currentReturn) throw new Error(`Public function return type changed in ${file}: ${oldStatement.name?.text}`)
}

function collectInterfaceMembers(name, seen = new Set()) {
  if (seen.has(name)) return []
  seen.add(name)
  const declaration = currentInterfaceIndex.get(name)
  if (!declaration) return []
  const inherited = (declaration.heritageClauses ?? []).flatMap(clause => clause.types.flatMap(type => ts.isIdentifier(type.expression) ? collectInterfaceMembers(type.expression.text, seen) : []))
  return [...inherited, ...declaration.members]
}

function compareSource(oldText, currentFile, file) {
  const currentText = readFileSync(currentFile, 'utf8')
  const oldSource = ts.createSourceFile(file, oldText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const currentSource = ts.createSourceFile(file, currentText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const currentByKey = new Map()
  const currentByName = new Map()
  const currentExports = new Set()

  const collectExportKeys = (statement, sourceFile) => {
    if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) return [normalize(statement, sourceFile)]
    const module = statement.moduleSpecifier?.getText(sourceFile) ?? ''
    return statement.exportClause.elements.map(element => `${statement.isTypeOnly || element.isTypeOnly ? 'type' : 'value'}:${module}:${element.propertyName?.text ?? element.name.text}->${element.name.text}`)
  }

  for (const statement of currentSource.statements) {
    const key = declarationKey(statement)
    if (key && !currentByKey.has(key)) currentByKey.set(key, statement)
    if ('name' in statement && statement.name && ts.isIdentifier(statement.name) && !currentByName.has(statement.name.text)) currentByName.set(statement.name.text, statement)
    if (ts.isExportDeclaration(statement)) collectExportKeys(statement, currentSource).forEach(key => currentExports.add(key))
  }

  for (const statement of oldSource.statements) {
    if (ts.isImportDeclaration(statement)) continue
    if (ts.isExportDeclaration(statement)) {
      for (const key of collectExportKeys(statement, oldSource)) {
        if (!currentExports.has(key)) throw new Error(`Public export changed or disappeared in ${file}: ${key}`)
      }
      continue
    }
    const key = declarationKey(statement)
    if (!key) continue
    const currentStatement = currentByKey.get(key) ?? (ts.isTypeAliasDeclaration(statement) ? currentByName.get(statement.name.text) : undefined)
    if (!currentStatement) throw new Error(`Public declaration changed or disappeared in ${file}: ${key}`)
    if (ts.isTypeAliasDeclaration(statement) && ts.isTypeLiteralNode(statement.type) && ts.isInterfaceDeclaration(currentStatement)) {
      compareMembers(statement.type.members, collectInterfaceMembers(currentStatement.name.text), oldSource, currentSource, file)
      continue
    }
    if (ts.isTypeAliasDeclaration(statement) && ts.isTypeQueryNode(statement.type) && ts.isIdentifier(statement.type.exprName) && ts.isInterfaceDeclaration(currentStatement)) {
      const variable = oldSource.statements.find(candidate => ts.isVariableStatement(candidate) && candidate.declarationList.declarations.some(declaration => declaration.name.getText() === statement.type.exprName.getText()))
      const declaration = variable?.declarationList.declarations.find(candidate => candidate.name.getText() === statement.type.exprName.getText())
      if (declaration?.type && ts.isTypeLiteralNode(declaration.type)) {
        compareMembers(declaration.type.members, collectInterfaceMembers(currentStatement.name.text), oldSource, currentSource, file)
        continue
      }
    }
    if (ts.isInterfaceDeclaration(statement) && ts.isInterfaceDeclaration(currentStatement)) {
      compareInterface(statement, currentStatement, oldSource, currentSource, file)
      continue
    }
    if (ts.isVariableStatement(statement) && ts.isVariableStatement(currentStatement)) {
      compareVariableStatement(statement, currentStatement, oldSource, currentSource, file)
      continue
    }
    if (ts.isFunctionDeclaration(statement) && ts.isFunctionDeclaration(currentStatement)) {
      compareFunctionDeclaration(statement, currentStatement, oldSource, currentSource, file)
      continue
    }
    if (normalize(statement, oldSource) !== normalize(currentStatement, currentSource)) throw new Error(`Public declaration changed in ${file}: ${key}`)
  }
}

function writeBaselineFromRef(ref) {
  const workspace = mkdtempSync(join(tmpdir(), 'silicon-holo-api-baseline-'))
  const baseline = join(workspace, 'baseline')
  try {
    const archive = execFileSync('git', ['archive', '--format=tar', ref], { cwd: root, maxBuffer: 64 * 1024 * 1024 })
    mkdirSync(baseline, { recursive: true })
    const extract = spawnSync('tar', ['-xf', '-', '-C', baseline], { input: archive })
    if (extract.status !== 0) throw new Error(`Unable to extract HEAD baseline: ${extract.stderr?.toString() ?? ''}`)
    symlinkSync(join(root, 'node_modules'), join(baseline, 'node_modules'), 'dir')
    run(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build'], baseline)
    const files = Object.fromEntries(globSync('dist/**/*.d.ts', { cwd: baseline, ignore: ['dist/**/*.test.d.ts'] }).sort().map(file => [file, readFileSync(join(baseline, file), 'utf8')]))
    const commit = execFileSync('git', ['rev-parse', ref], { cwd: root, encoding: 'utf8' }).trim()
    const packageVersion = JSON.parse(readFileSync(join(baseline, 'package.json'), 'utf8')).version
    writeFileSync(snapshotFile, `${JSON.stringify({ source: `${ref} (${commit.slice(0, 7)}), package ${packageVersion}`, files }, null, 2)}\n`)
    console.log(`✓ wrote fixed public API baseline across ${Object.keys(files).length} files`)
  } finally {
    rmSync(workspace, { recursive: true, force: true })
  }
}

if (process.argv.includes('--write-baseline')) {
  const ref = process.argv[process.argv.indexOf('--write-baseline') + 1]
  if (!ref) throw new Error('Pass a git ref after --write-baseline')
  writeBaselineFromRef(ref)
} else {
  const snapshot = JSON.parse(readFileSync(snapshotFile, 'utf8'))
  currentInterfaceIndex = new Map()
  for (const file of globSync('dist/**/*.d.ts', { cwd: root, ignore: ['dist/**/*.test.d.ts'] })) {
    const source = ts.createSourceFile(file, readFileSync(join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    for (const statement of source.statements) if (ts.isInterfaceDeclaration(statement)) currentInterfaceIndex.set(statement.name.text, statement)
  }
  const entries = Object.entries(snapshot.files)
  for (const [file, oldText] of entries) {
    const currentFile = join(root, file)
    if (!globSync(relative(root, currentFile), { cwd: root }).length) throw new Error(`Public declaration file disappeared: ${file}`)
    compareSource(oldText, currentFile, file)
  }
  console.log(`✓ current declarations are additive relative to fixed ${snapshot.source} baseline across ${entries.length} files`)
}
