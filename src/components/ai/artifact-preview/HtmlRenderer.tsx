import { useRef, useCallback } from 'react'

interface HtmlRendererProps { code: string }

export function HtmlRenderer({ code }: HtmlRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleLoad = useCallback(() => {
    try { iframeRef.current?.contentDocument?.body && (iframeRef.current.contentDocument.body.style.margin = '0') } catch { /* cross-origin */ }
  }, [])

  return (
    <iframe ref={iframeRef} srcDoc={code} sandbox="allow-scripts allow-same-origin" className="w-full h-full border-0 bg-white rounded" title="HTML Preview" onLoad={handleLoad} />
  )
}
