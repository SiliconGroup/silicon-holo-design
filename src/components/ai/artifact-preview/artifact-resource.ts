import type { Artifact, ArtifactSource } from '@/types'

const binaryUrlTypes = new Set(['pdf', 'xlsx', 'xls', 'spreadsheet'])

function readBlob(blob: Blob, mode: 'text'): Promise<string>
function readBlob(blob: Blob, mode: 'arrayBuffer'): Promise<ArrayBuffer>
function readBlob(blob: Blob, mode: 'text' | 'arrayBuffer') {
  if (mode === 'text' && typeof blob.text === 'function') return blob.text()
  if (mode === 'arrayBuffer' && typeof blob.arrayBuffer === 'function') return blob.arrayBuffer()
  return new Promise<string | ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read Blob'))
    reader.onload = () => resolve(reader.result as string | ArrayBuffer)
    if (mode === 'text') reader.readAsText(blob)
    else reader.readAsArrayBuffer(blob)
  })
}

export function normalizeArtifactType(artifact: Artifact) {
  const explicit = artifact.type.toLowerCase()
  const mime = artifact.mimeType?.toLowerCase() ?? ''
  const name = (artifact.fileName ?? artifact.title ?? '').toLowerCase()

  if (explicit === 'md' || explicit === 'markdown' || mime === 'text/markdown' || name.endsWith('.md') || name.endsWith('.markdown')) return 'markdown'
  if (explicit === 'pdf' || mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (['xlsx', 'xls', 'spreadsheet'].includes(explicit) || mime.includes('spreadsheet') || mime.includes('excel') || /\.xlsx?$/.test(name)) return 'spreadsheet'
  return explicit
}

export function resolveArtifactSource(artifact: Artifact): ArtifactSource {
  if (artifact.source) return artifact.source
  return binaryUrlTypes.has(normalizeArtifactType(artifact))
    ? { kind: 'url', url: artifact.content }
    : { kind: 'text', value: artifact.content }
}

export function artifactHasTextSource(artifact: Artifact) {
  const type = normalizeArtifactType(artifact)
  if (type === 'pdf' || type === 'spreadsheet') return false
  const source = resolveArtifactSource(artifact)
  return source.kind === 'text' || source.kind === 'url' || source.kind === 'blob' || source.kind === 'arrayBuffer'
}

export async function readArtifactText(artifact: Artifact, signal?: AbortSignal) {
  const source = resolveArtifactSource(artifact)
  switch (source.kind) {
    case 'text': return source.value
    case 'url': {
      const response = await fetch(source.url, { signal })
      if (!response.ok) throw new Error(`Unable to load resource (${response.status})`)
      return response.text()
    }
    case 'blob': return readBlob(source.blob, 'text')
    case 'arrayBuffer': return new TextDecoder().decode(source.data)
  }
}

export async function readArtifactArrayBuffer(artifact: Artifact, signal?: AbortSignal) {
  const source = resolveArtifactSource(artifact)
  switch (source.kind) {
    case 'text': return new TextEncoder().encode(source.value).buffer
    case 'url': {
      const response = await fetch(source.url, { signal })
      if (!response.ok) throw new Error(`Unable to load resource (${response.status})`)
      return response.arrayBuffer()
    }
    case 'blob': return readBlob(source.blob, 'arrayBuffer')
    case 'arrayBuffer': return source.data
  }
}

export function artifactDownloadName(artifact: Artifact) {
  if (artifact.fileName) return artifact.fileName
  const type = normalizeArtifactType(artifact)
  const extension = type === 'spreadsheet' ? 'xlsx' : type === 'markdown' ? 'md' : type || 'txt'
  const title = artifact.title?.trim() || 'artifact'
  return title.toLowerCase().endsWith(`.${extension}`) ? title : `${title}.${extension}`
}
