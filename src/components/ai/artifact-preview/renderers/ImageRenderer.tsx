import { useEffect, useState } from 'react'
import type { Artifact } from '@/types'
import { resolveArtifactSource } from '../artifact-resource'

/**
 * 图片渲染器。
 *
 * 历史实现直接把 `artifact.content` 当作 `src`，因此 URL / Blob / ArrayBuffer 来源会静默变成
 * `src=""`（浏览器显示破图）。这里改为走 `resolveArtifactSource`，与其余渲染器保持一致。
 * legacy 调用方把 URL 或 data URL 放在 `content` 里仍然可用：那会解析成 `text` 来源。
 */
export function ImageRenderer({ artifact }: { artifact: Artifact }) {
  const source = resolveArtifactSource(artifact)
  const sourceUrl = source.kind === 'url' ? source.url : null
  const sourceText = source.kind === 'text' ? source.value : null
  const sourceBlob = source.kind === 'blob' ? source.blob : null
  const sourceBuffer = source.kind === 'arrayBuffer' ? source.data : null
  const mimeType = artifact.mimeType
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  useEffect(() => {
    const blob = sourceBlob ?? (sourceBuffer === null ? null : new Blob([sourceBuffer], { type: mimeType }))
    // jsdom 没有 createObjectURL
    if (blob === null || typeof URL.createObjectURL !== 'function') {
      setObjectUrl(null)
      return
    }
    const url = URL.createObjectURL(blob)
    setObjectUrl(url)
    return () => { URL.revokeObjectURL(url) }
  }, [sourceBlob, sourceBuffer, mimeType])

  const src = sourceUrl ?? objectUrl ?? sourceText ?? ''

  return <div className="flex h-full w-full items-center justify-center p-4"><img src={src} alt={artifact.title || 'Image'} className="max-h-full max-w-full rounded object-contain" /></div>
}
