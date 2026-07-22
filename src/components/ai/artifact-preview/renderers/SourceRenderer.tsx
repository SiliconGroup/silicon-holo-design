import hljs from 'highlight.js'
import type { Artifact } from '@/types'
import { useArtifactText } from '../use-artifact-resource'
import { RendererError, RendererLoading } from './RendererState'

export function SourceRenderer({ artifact }: { artifact: Artifact }) {
  const { data, error, loading } = useArtifactText(artifact)
  if (loading) return <RendererLoading label="Loading source" />
  if (error || data === null) return <RendererError message={error ?? 'Source is unavailable'} />
  const language = artifact.type === 'html' ? 'html' : artifact.type
  const highlighted = hljs.getLanguage(language)
    ? hljs.highlight(data, { language }).value
    : hljs.highlightAuto(data).value
  return <pre className="shd-scrollbar box-border m-0 h-full overflow-auto bg-surface-canvas p-4 text-sm"><code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
}
