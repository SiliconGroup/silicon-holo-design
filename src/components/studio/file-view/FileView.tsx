import { useMemo, useState, type ReactNode } from 'react'
import { HoloEmpty } from '@/components/data-display/empty'
import { ArtifactRenderer } from '@/components/ai/artifact-preview'
import { useArtifactText } from '@/components/ai/artifact-preview/use-artifact-resource'
import { RendererError, RendererLoading } from '@/components/ai/artifact-preview/renderers/RendererState'
import type { Artifact } from '@/types'
import type { HoloFileKind, HoloFileViewMode, HoloFileViewProps, HoloStudioFile } from '../types'
import { HoloCodeView } from '../code-view'
import { inferFileKind, inferLanguageId } from '../utils/file-kind'
import { useStudioLocale, type StudioLocale } from '../utils/use-studio-locale'

const DEFAULT_MAX_RENDER_BYTES = 512 * 1024

/**
 * 这些 kind 的渲染器读的是 `artifact.content`（字符串），而不是 `artifact.source`：
 * SvgRenderer 用 dangerouslySetInnerHTML，HtmlRenderer 用 code prop。
 * 因此非 text 来源必须先把文本取回来，否则会静默渲染成空白。
 */
const contentBackedKinds = new Set<HoloFileKind>(['svg', 'html'])

/**
 * 既有渲染视图、内容又是文本的 kind：可以在预览与源码之间切换。
 * code 只有源码，pdf / spreadsheet / image / binary 只有预览，都不提供切换。
 */
const toggleableKinds = new Set<HoloFileKind>(['markdown', 'svg', 'html'])

/** kind → Artifact.type。ArtifactRenderer 内部还会做一次 normalize。 */
const artifactTypeByKind: Partial<Record<HoloFileKind, string>> = {
  markdown: 'markdown',
  pdf: 'pdf',
  spreadsheet: 'spreadsheet',
  image: 'image',
  svg: 'svg',
  html: 'html',
}

function toArtifact(file: HoloStudioFile, type: string): Artifact {
  return {
    id: file.id,
    type,
    title: file.fileName,
    content: file.source.kind === 'text' ? file.source.value : '',
    source: file.source,
    mimeType: file.mimeType,
    fileName: file.fileName,
  }
}

/**
 * 异步来源的代码分支：url / blob / arrayBuffer 复用库内既有的 artifact 文本加载。
 * 同步的 text 来源**不走这里**，否则每次受控编辑都会重新进入 loading 态，
 * 导致编辑器被卸载重建、焦点与光标丢失。
 */
function AsyncTextBranch({
  file,
  render,
}: {
  file: HoloStudioFile
  render(value: string): ReactNode
}) {
  const locale = useStudioLocale()
  const artifact = useMemo(() => toArtifact(file, 'plaintext'), [file.id, file.source])
  const { data, error, loading } = useArtifactText(artifact)

  if (loading) return <RendererLoading label={locale.loadingFile} />
  if (error !== null || data === null) return <RendererError message={error ?? locale.loadFileFailed} />
  return <>{render(data)}</>
}

/** 模式切换器。视觉沿用库内既有的 shd-segmented-control-button 契约。 */
function ModeToggle({ mode, onChange, locale }: { mode: HoloFileViewMode; onChange(next: HoloFileViewMode): void; locale: StudioLocale }) {
  const options: { value: HoloFileViewMode; label: string }[] = [
    { value: 'preview', label: locale.previewMode },
    { value: 'source', label: locale.sourceMode },
  ]
  return (
    <div className="flex flex-none items-center justify-end gap-0.5 border-b border-stroke-muted bg-surface-base px-2 py-1" role="group" aria-label={locale.viewMode}>
      {options.map(option => {
        const active = option.value === mode
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`
              shd-segmented-control-button border-none shd-control-focus bg-transparent relative inline-flex h-6 items-center rounded-sm px-2
              transition-colors duration-150
              ${active ? 'text-content-accent' : 'text-content-tertiary hover:text-content-primary'}
            `}
          >
            {active && <span aria-hidden="true" className="absolute inset-0 rounded-sm bg-surface-selected" />}
            <span className="relative">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * 按文件种类分派：代码走注入的渲染器（默认只读 HoloCodeView），
 * 可预览文档走库内既有的 ArtifactRenderer，其余渲染占位。
 *
 * markdown / svg / html 这类「既有渲染视图、内容又是文本」的 kind 额外提供
 * 预览 / 源码切换（默认预览）。code 只有源码，pdf / spreadsheet / image / binary 只有预览，
 * 两者都不显示切换器。
 */
export function HoloFileView({
  file,
  codeRenderer,
  renderers,
  onChange,
  onSaveIntent,
  emptyContent,
  maxRenderBytes = DEFAULT_MAX_RENDER_BYTES,
  onExceedLimit,
  mode: controlledMode,
  onModeChange,
  defaultMode = 'preview',
  showModeToggle = true,
  className = '',
}: HoloFileViewProps) {
  const locale = useStudioLocale()
  /*
   * 非受控模式按文件重置：每打开一个新文件都回到 defaultMode（默认预览）。
   * 否则用户看过一次源码之后，后面打开的每个 markdown 都会停在源码模式。
   * 需要按标签保持选择的宿主可以自己受控 mode。
   * 用派生值而不是 effect，避免先渲染错误模式再纠正造成闪烁。
   */
  const [internalMode, setInternalMode] = useState<{ id?: string; mode: HoloFileViewMode }>({ mode: defaultMode })
  const mode = controlledMode ?? (internalMode.id === file?.id ? internalMode.mode : defaultMode)
  const setMode = (next: HoloFileViewMode) => {
    if (controlledMode === undefined) setInternalMode({ id: file?.id, mode: next })
    onModeChange?.(next)
  }

  let body: ReactNode
  let toggle: ReactNode = null
  if (!file) {
    body = emptyContent ?? <HoloEmpty description={locale.noFileOpen} />
  } else {
    const kind = file.kind ?? inferFileKind({ fileName: file.fileName, mimeType: file.mimeType })
    const override = renderers?.[kind]
    const toggleable = toggleableKinds.has(kind)
    if (toggleable && showModeToggle && !override) {
      toggle = <ModeToggle mode={mode} onChange={setMode} locale={locale} />
    }
    if (override) body = override(file)
    else if (kind === 'code' || (toggleable && mode === 'source')) {
      const Renderer = codeRenderer
      const languageId = file.languageId ?? inferLanguageId(file.fileName)
      const renderCode = (value: string) => Renderer
        ? <Renderer
            value={value}
            languageId={languageId}
            readOnly={file.readOnly === true}
            onChange={onChange ? next => onChange(file, next) : undefined}
            onSaveIntent={onSaveIntent ? () => onSaveIntent(file) : undefined}
          />
        : <HoloCodeView
            value={value}
            languageId={languageId}
            byteSize={file.byteSize}
            maxRenderBytes={maxRenderBytes}
            onExceedLimit={bytes => onExceedLimit?.(file, bytes)}
          />
      body = file.source.kind === 'text'
        ? renderCode(file.source.value)
        : <AsyncTextBranch key={file.id} file={file} render={renderCode} />
    } else {
      const artifactType = artifactTypeByKind[kind]
      if (!artifactType) body = <HoloEmpty description={locale.unsupportedFile} />
      else if (contentBackedKinds.has(kind) && file.source.kind !== 'text') {
        body = (
          <AsyncTextBranch
            key={file.id}
            file={file}
            render={text => <ArtifactRenderer artifact={{ ...toArtifact(file, artifactType), content: text, source: { kind: 'text', value: text } }} />}
          />
        )
      } else body = <ArtifactRenderer artifact={toArtifact(file, artifactType)} />
    }
  }

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${className}`}>
      {toggle}
      {body}
    </div>
  )
}
