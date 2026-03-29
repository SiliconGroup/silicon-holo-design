import { useState, useCallback, useEffect, type ReactNode } from 'react'
import hljs from 'highlight.js'
import { HoloPortal } from '@/utils/portal'
import { HoloTab } from '@/components/navigation/tabs'
import { useLocale } from '@/locale'
import { HtmlRenderer } from './HtmlRenderer'
import type { Artifact } from '@/types'

export interface ArtifactPreviewDrawerProps {
  artifact: Artifact | null
  onClose: () => void
  width?: string
  renderers?: Partial<Record<string, (artifact: Artifact) => ReactNode>>
}

function CodeView({ code, lang }: { code: string; lang: string }) {
  const highlighted = hljs.getLanguage(lang)
    ? hljs.highlight(code, { language: lang }).value
    : hljs.highlightAuto(code).value
  return (
    <pre className="m-0 p-4 bg-scene-void/80 overflow-auto h-full text-sm">
      <code className={`language-${lang}`} dangerouslySetInnerHTML={{ __html: highlighted }} />
    </pre>
  )
}

function BuiltinRenderer({ artifact }: { artifact: Artifact }) {
  switch (artifact.type) {
    case 'html': return <HtmlRenderer code={artifact.content} />
    case 'svg': return <div className="w-full h-full flex items-center justify-center p-4 bg-white/5 rounded"><div dangerouslySetInnerHTML={{ __html: artifact.content }} className="max-w-full max-h-full [&_svg]:max-w-full [&_svg]:max-h-full" /></div>
    case 'image': return <div className="w-full h-full flex items-center justify-center p-4"><img src={artifact.content} alt={artifact.title || 'Image'} className="max-w-full max-h-full object-contain rounded" /></div>
    default: return <div className="p-4 text-white/40">Unsupported type: {artifact.type}</div>
  }
}

export function ArtifactPreviewDrawer({ artifact, onClose, width = '50vw', renderers }: ArtifactPreviewDrawerProps) {
  const locale = useLocale()
  const [mode, setMode] = useState<'code' | 'preview'>('preview')
  const [copied, setCopied] = useState(false)

  useEffect(() => { if (artifact) setMode('preview') }, [artifact?.id])

  useEffect(() => {
    if (!artifact) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [artifact, onClose])

  const handleCopy = useCallback(() => {
    if (!artifact) return
    navigator.clipboard.writeText(artifact.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [artifact])

  const handleDownload = useCallback(() => {
    if (!artifact) return
    const ext = artifact.type === 'html' ? 'html' : artifact.type === 'svg' ? 'svg' : 'txt'
    const blob = new Blob([artifact.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${artifact.title || 'artifact'}.${ext}`; a.click()
    URL.revokeObjectURL(url)
  }, [artifact])

  if (!artifact) return null

  const custom = renderers?.[artifact.type]

  return (
    <HoloPortal>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-scene-deep/95 border-l border-holo-cyan/20 backdrop-blur animate-[slideInRight_200ms_ease-out]" style={{ width }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-holo-cyan/15 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-white/80">{artifact.title || artifact.type.toUpperCase()}</h3>
            <HoloTab items={[{ key: 'code', label: locale.ai.artifactCode }, { key: 'preview', label: locale.ai.artifactPreview }]} activeKey={mode} onChange={(k) => setMode(k as 'code' | 'preview')} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="px-2 py-1 text-[11px] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded transition-colors">{copied ? locale.ai.copied : locale.ai.copy}</button>
            <button onClick={handleDownload} className="px-2 py-1 text-[11px] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded transition-colors">{locale.ai.artifactDownload}</button>
            <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {mode === 'code' ? <CodeView code={artifact.content} lang={artifact.type === 'html' ? 'html' : artifact.type} /> : (custom ? custom(artifact) : <BuiltinRenderer artifact={artifact} />)}
        </div>
      </div>
    </HoloPortal>
  )
}
