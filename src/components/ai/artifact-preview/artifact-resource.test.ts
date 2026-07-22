import { describe, expect, it, vi } from 'vitest'
import { artifactDownloadName, artifactHasTextSource, normalizeArtifactType, readArtifactArrayBuffer, readArtifactText, resolveArtifactSource } from './artifact-resource'

describe('artifact resource compatibility', () => {
  it('preserves legacy text content and infers modern formats', () => {
    const markdown = { id: 'md', type: 'text', title: 'guide.md', content: '# Guide', mimeType: 'text/markdown' }
    expect(normalizeArtifactType(markdown)).toBe('markdown')
    expect(resolveArtifactSource(markdown)).toEqual({ kind: 'text', value: '# Guide' })
    expect(artifactHasTextSource(markdown)).toBe(true)
  })

  it('treats legacy PDF and spreadsheet content as URLs without changing the existing shape', () => {
    const pdf = { id: 'pdf', type: 'pdf', title: 'Paper', content: '/paper.pdf' }
    const workbook = { id: 'xlsx', type: 'xlsx', title: 'Metrics', content: '/metrics.xlsx' }
    expect(resolveArtifactSource(pdf)).toEqual({ kind: 'url', url: '/paper.pdf' })
    expect(resolveArtifactSource(workbook)).toEqual({ kind: 'url', url: '/metrics.xlsx' })
    expect(artifactHasTextSource(pdf)).toBe(false)
    expect(artifactDownloadName(workbook)).toBe('Metrics.xlsx')
  })

  it('loads URL, Blob, and ArrayBuffer sources through the shared adapter', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('remote markdown'))
    await expect(readArtifactText({ id: 'url', type: 'markdown', content: '', source: { kind: 'url', url: '/fixture.md' } })).resolves.toBe('remote markdown')
    await expect(readArtifactText({ id: 'blob', type: 'markdown', content: '', source: { kind: 'blob', blob: new Blob(['blob markdown']) } })).resolves.toBe('blob markdown')
    const data = new TextEncoder().encode('binary data').buffer
    await expect(readArtifactArrayBuffer({ id: 'buffer', type: 'xlsx', content: '', source: { kind: 'arrayBuffer', data } })).resolves.toBe(data)
    fetchMock.mockRestore()
  })
})
