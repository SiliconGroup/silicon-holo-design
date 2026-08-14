import { describe, expect, it } from 'vitest'
import { studioLanguageSupport } from './language-support'
import { inferLanguageId } from '../utils/file-kind'

describe('studioLanguageSupport', () => {
  it('covers the language ids the file-kind helper can produce for shipped packs', () => {
    for (const [fileName, languageId] of [
      ['a.ts', 'typescript'],
      ['a.js', 'javascript'],
      ['a.json', 'json'],
      ['a.md', 'markdown'],
      ['a.py', 'python'],
      ['a.rs', 'rust'],
      ['a.html', 'html'],
      ['a.css', 'css'],
    ] as const) {
      expect(inferLanguageId(fileName)).toBe(languageId)
      expect(typeof studioLanguageSupport[languageId], languageId).toBe('function')
    }
  })

  it('resolves each loader to a usable extension', async () => {
    for (const [languageId, load] of Object.entries(studioLanguageSupport)) {
      const support = await load()
      expect(support, languageId).toBeTruthy()
    }
  })

  it('has no entry for languages without a bundled pack', () => {
    expect(studioLanguageSupport.go).toBeUndefined()
    expect(studioLanguageSupport.java).toBeUndefined()
  })
})
