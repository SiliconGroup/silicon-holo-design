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

export interface ArtifactRendererProps {
  artifact: Artifact
  /** HTML 预览的逃逸回调；内联使用时可省略。 */
  onEscape?: () => void
}

/**
 * 稳定的空实现。仅用于 `onEscape` 被省略时的 HTML 分支：
 * 内联 `() => {}` 会让 HtmlRenderer 每次渲染都收到新的回调引用。
 * 其他分支不接收该回调。
 */
const noEscape = () => {}

export function ArtifactRenderer({ artifact, onEscape }: ArtifactRendererProps) {
  const type = normalizeArtifactType(artifact)
  const escape = onEscape ?? noEscape
  let content
  switch (type) {
    case 'html': content = <HtmlRenderer code={artifact.content} onEscape={escape} />; break
    case 'svg': content = <SvgRenderer artifact={artifact} />; break
    case 'image': content = <ImageRenderer artifact={artifact} />; break
    case 'markdown': content = <MarkdownRenderer artifact={artifact} />; break
    case 'pdf': content = <PdfRenderer artifact={artifact} />; break
    case 'spreadsheet': content = <SpreadsheetRenderer artifact={artifact} />; break
    default: content = <div className="p-4 text-content-tertiary">Unsupported type: {artifact.type}</div>
  }
  return <Suspense fallback={<RendererLoading />}>{content}</Suspense>
}
