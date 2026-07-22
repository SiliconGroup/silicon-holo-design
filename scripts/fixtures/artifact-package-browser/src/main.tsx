import { StrictMode, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArtifactPreviewDrawer, type Artifact } from 'silicon-holo-design'
import 'silicon-holo-design/styles'

type Phase = 'url' | 'blob' | 'buffer' | 'closed' | 'reopened' | 'pass'

function App() {
  const [phase, setPhase] = useState<Phase>('url')
  const [artifact, setArtifact] = useState<Artifact | null>({ id: 'url-pdf', type: 'pdf', title: 'URL PDF', content: '/sample.pdf' })
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null)
  const loadStarted = useRef(false)
  const blob = useMemo(() => buffer ? new Blob([buffer.slice(0)], { type: 'application/pdf' }) : null, [buffer])

  useEffect(() => {
    if (loadStarted.current) return
    loadStarted.current = true
    fetch('/sample.pdf').then(response => response.arrayBuffer()).then(data => {
      document.body.dataset.originalBytes = String(data.byteLength)
      setBuffer(data)
    }).catch(error => {
      document.body.dataset.artifactPackageError = error instanceof Error ? error.message : String(error)
    })
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.body.dataset.artifactPackageError) return
      const loaded = document.querySelector('[data-shd-artifact-renderer="pdf"]')?.getAttribute('data-shd-pdf-loaded') === 'true'
      if (!loaded) return

      if (phase === 'url' && blob) {
        setArtifact(null)
        setPhase('blob')
        window.setTimeout(() => setArtifact({ id: 'blob-pdf', type: 'pdf', title: 'Blob PDF', content: '', source: { kind: 'blob', blob } }), 50)
        return
      }
      if (phase === 'blob' && buffer) {
        setArtifact(null)
        setPhase('buffer')
        window.setTimeout(() => setArtifact({ id: 'buffer-pdf', type: 'pdf', title: 'ArrayBuffer PDF', content: '', source: { kind: 'arrayBuffer', data: buffer } }), 50)
        return
      }
      if (phase === 'buffer' && buffer) {
        document.querySelector<HTMLButtonElement>('button[title="Zoom in"]')?.click()
        document.body.dataset.currentBytes = String(buffer.byteLength)
        if (buffer.byteLength === 0) {
          document.body.dataset.artifactPackageError = 'ArrayBuffer was detached after PDF load.'
          return
        }
        setArtifact(null)
        setPhase('closed')
        window.setTimeout(() => {
          setPhase('reopened')
          setArtifact({ id: 'buffer-pdf-reopened', type: 'pdf', title: 'Reopened ArrayBuffer PDF', content: '', source: { kind: 'arrayBuffer', data: buffer } })
        }, 50)
        return
      }
      if (phase === 'reopened' && buffer) {
        document.body.dataset.currentBytes = String(buffer.byteLength)
        if (buffer.byteLength === 0) {
          document.body.dataset.artifactPackageError = 'ArrayBuffer was detached after reopening PDF.'
          return
        }
        document.body.dataset.artifactPackageContract = 'pass'
        setPhase('pass')
      }
    }, 50)
    return () => window.clearInterval(timer)
  }, [blob, buffer, phase])

  return <ArtifactPreviewDrawer artifact={artifact} onClose={() => setArtifact(null)} constrainToViewport />
}

window.addEventListener('error', event => {
  document.body.dataset.artifactPackageError = event.error?.message || event.message
})
window.addEventListener('unhandledrejection', event => {
  document.body.dataset.artifactPackageError = event.reason?.message || String(event.reason)
})

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
