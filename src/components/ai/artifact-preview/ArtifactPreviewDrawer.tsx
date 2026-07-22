import { useState, useCallback, useEffect, useId, useRef, type ReactNode } from 'react'
import { HoloPortal } from '@/utils/portal'
import { focusFirstOrContainer, restoreFocus, trapFocus } from '@/utils/focus'
import { HoloTab } from '@/components/navigation/tabs'
import { useLocale } from '@/locale'
import { lockDocumentScroll } from '@/utils/scroll-lock'
import type { Artifact } from '@/types'
import { ArtifactRenderer } from './ArtifactRenderer'
import { SourceRenderer } from './renderers/SourceRenderer'
import { artifactDownloadName, artifactHasTextSource, normalizeArtifactType, readArtifactArrayBuffer, readArtifactText, resolveArtifactSource } from './artifact-resource'

export interface ArtifactPreviewDrawerProps {
  artifact: Artifact | null
  onClose: () => void
  width?: string
  constrainToViewport?: boolean
  renderers?: Partial<Record<string, (artifact: Artifact) => ReactNode>>
}

export function ArtifactPreviewDrawer({ artifact, onClose, width = '50vw', constrainToViewport = false, renderers }: ArtifactPreviewDrawerProps) {
  const locale = useLocale()
  const titleId = useId()
  const drawerRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const [mode, setMode] = useState<'code' | 'preview'>('preview')
  const [copied, setCopied] = useState(false)
  onCloseRef.current = onClose
  const handleClose = useCallback(() => onCloseRef.current(), [])

  useEffect(() => { if (artifact) setMode('preview') }, [artifact?.id])

  useEffect(() => {
    if (!artifact) return
    const previousFocus = document.activeElement as HTMLElement | null
    const unlockScroll = lockDocumentScroll()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
      if (drawerRef.current) trapFocus(event, drawerRef.current)
    }
    document.addEventListener('keydown', handleKeyDown)
    queueMicrotask(() => {
      if (drawerRef.current) focusFirstOrContainer(drawerRef.current)
    })
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      restoreFocus(previousFocus)
      unlockScroll()
    }
  }, [artifact?.id, handleClose])

  const handleCopy = useCallback(async () => {
    if (!artifact) return
    await navigator.clipboard.writeText(await readArtifactText(artifact))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [artifact])

  const handleDownload = useCallback(async () => {
    if (!artifact) return
    const source = resolveArtifactSource(artifact)
    if (source.kind === 'url') {
      const anchor = document.createElement('a')
      anchor.href = source.url; anchor.download = artifactDownloadName(artifact); anchor.click()
      return
    }
    const data = source.kind === 'text' ? new Blob([source.value], { type: artifact.mimeType ?? 'text/plain' }) : source.kind === 'blob' ? source.blob : new Blob([await readArtifactArrayBuffer(artifact)], { type: artifact.mimeType })
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url; a.download = artifactDownloadName(artifact); a.click()
    URL.revokeObjectURL(url)
  }, [artifact])

  if (!artifact) return null

  const custom = renderers?.[artifact.type]
  const canShowSource = artifactHasTextSource(artifact)
  const canCopy = canShowSource
  const type = normalizeArtifactType(artifact)

  return (
    <HoloPortal>
      <div className="shd-z-overlay fixed inset-0 bg-[var(--shd-overlay-scrim)] backdrop-blur-sm" onClick={onClose} />
      <div ref={drawerRef} data-shd-motion="overlay" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="shd-spectral-glass shd-z-overlay shd-drawer-edge-left fixed bottom-0 right-0 top-0 flex flex-col overflow-hidden text-content-primary shadow-[-24px_0_60px_rgba(0,0,0,0.3)] animate-[slideInRight_200ms_var(--shd-ease-standard)]" style={constrainToViewport ? { width, minWidth: 'min(20rem, calc(100vw - 16px))', maxWidth: 'calc(100vw - 16px)' } : { width }}>
        <div className="shd-overlay-header flex flex-shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h3 id={titleId} className="text-sm font-medium text-content-primary">{artifact.title || artifact.type.toUpperCase()}</h3>
            {canShowSource && <HoloTab items={[{ key: 'code', label: locale.ai.artifactCode }, { key: 'preview', label: locale.ai.artifactPreview }]} activeKey={mode} onChange={(k) => setMode(k as 'code' | 'preview')} />}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canCopy && <button type="button" onClick={handleCopy} className="shd-control-focus bg-transparent rounded-sm border border-stroke-subtle px-2 py-1 text-[11px] text-content-tertiary transition-colors hover:border-stroke-default hover:text-content-primary">{copied ? locale.ai.copied : locale.ai.copy}</button>}
            <button type="button" onClick={handleDownload} className="shd-control-focus bg-transparent rounded-sm border border-stroke-subtle px-2 py-1 text-[11px] text-content-tertiary transition-colors hover:border-stroke-default hover:text-content-primary">{locale.ai.artifactDownload}</button>
            <button type="button" onClick={onClose} aria-label={locale.common.close} className="shd-control-focus border-none bg-transparent text-content-tertiary transition-colors duration-150 hover:text-content-primary"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {mode === 'code' && canShowSource ? <SourceRenderer artifact={artifact} /> : (custom ? custom(artifact) : <ArtifactRenderer artifact={{ ...artifact, type }} onEscape={handleClose} />)}
        </div>
      </div>
    </HoloPortal>
  )
}
