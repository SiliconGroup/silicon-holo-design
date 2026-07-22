import { useEffect, useState } from 'react'
import type { Artifact } from '@/types'
import { readArtifactArrayBuffer, readArtifactText } from './artifact-resource'

type ResourceState<T> = { data: T | null; error: string | null; loading: boolean }

function useArtifactLoader<T>(artifact: Artifact, loader: (artifact: Artifact, signal: AbortSignal) => Promise<T>, enabled = true): ResourceState<T> {
  const [state, setState] = useState<ResourceState<T>>({ data: null, error: null, loading: enabled })

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, loading: false })
      return
    }
    const controller = new AbortController()
    setState({ data: null, error: null, loading: true })
    loader(artifact, controller.signal).then(
      data => setState({ data, error: null, loading: false }),
      error => {
        if (!controller.signal.aborted) setState({ data: null, error: error instanceof Error ? error.message : String(error), loading: false })
      },
    )
    return () => controller.abort()
  }, [artifact.id, artifact.content, artifact.source, enabled, loader])

  return state
}

export function useArtifactText(artifact: Artifact) {
  return useArtifactLoader(artifact, readArtifactText)
}

export function useArtifactArrayBuffer(artifact: Artifact, enabled = true) {
  return useArtifactLoader(artifact, readArtifactArrayBuffer, enabled)
}
