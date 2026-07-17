import { useCallback, useEffect, useRef } from 'react'

interface HtmlRendererProps { code: string; title?: string; className?: string; onEscape?: () => void }

export function HtmlRenderer({ code, title = 'HTML Preview', className = 'bg-white', onEscape }: HtmlRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const removeKeyListenerRef = useRef<(() => void) | null>(null)

  useEffect(() => () => removeKeyListenerRef.current?.(), [])

  const handleLoad = useCallback(() => {
    removeKeyListenerRef.current?.()
    removeKeyListenerRef.current = null
    try {
      const iframeDocument = iframeRef.current?.contentDocument
      if (!iframeDocument) return
      if (iframeDocument.body) iframeDocument.body.style.margin = '0'
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') onEscape?.()
      }
      iframeDocument.addEventListener('keydown', handleKeyDown)
      removeKeyListenerRef.current = () => iframeDocument.removeEventListener('keydown', handleKeyDown)
    } catch {
      // Preserve the preview when a document becomes cross-origin.
    }
  }, [onEscape])
  return (
    <iframe ref={iframeRef} srcDoc={code} sandbox="allow-scripts allow-same-origin" className={`w-full h-full border-0 rounded ${className}`} title={title} onLoad={handleLoad} />
  )
}
