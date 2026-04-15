import { useRef, useCallback, useMemo, useEffect } from 'react'

interface HtmlRendererProps { code: string }

export function HtmlRenderer({ code }: HtmlRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const blobUrlRef = useRef<string | null>(null)

  const blobUrl = useMemo(() => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    blobUrlRef.current = url
    return url
  }, [code])

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [])

  const handleLoad = useCallback(() => {
    try { iframeRef.current?.contentDocument?.body && (iframeRef.current.contentDocument.body.style.margin = '0') } catch { /* cross-origin */ }
  }, [])

  return (
    <iframe ref={iframeRef} src={blobUrl} sandbox="allow-scripts allow-same-origin" className="w-full h-full border-0 bg-white rounded" title="HTML Preview" onLoad={handleLoad} />
  )
}
