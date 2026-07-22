import { lazy, Suspense } from 'react'
import type { Artifact } from '@/types'
import { normalizeArtifactType } from './artifact-resource'
import { HtmlRenderer } from './HtmlRenderer'
import { ImageRenderer } from './renderers/ImageRenderer'
import { SvgRenderer } from './renderers/SvgRenderer'
import { RendererLoading } from './renderers/RendererState'

const MarkdownRenderer = lazy(() => import('./renderers/MarkdownRenderer').then(module => ({ default: module.MarkdownRenderer })))
const PdfRenderer = lazy(() => import('./renderers/PdfRenderer').then(module => ({ default: module.PdfRenderer })))
const SpreadsheetRenderer = lazy(() => import('./renderers/SpreadsheetRenderer').then(module => ({ default: module.SpreadsheetRenderer })))

export function ArtifactRenderer({ artifact, onEscape }: { artifact: Artifact; onEscape: () => void }) {
  const type = normalizeArtifactType(artifact)
  let content
  switch (type) {
    case 'html': content = <HtmlRenderer code={artifact.content} onEscape={onEscape} />; break
    case 'svg': content = <SvgRenderer artifact={artifact} />; break
    case 'image': content = <ImageRenderer artifact={artifact} />; break
    case 'markdown': content = <MarkdownRenderer artifact={artifact} />; break
    case 'pdf': content = <PdfRenderer artifact={artifact} />; break
    case 'spreadsheet': content = <SpreadsheetRenderer artifact={artifact} />; break
    default: content = <div className="p-4 text-content-tertiary">Unsupported type: {artifact.type}</div>
  }
  return <Suspense fallback={<RendererLoading />}>{content}</Suspense>
}
