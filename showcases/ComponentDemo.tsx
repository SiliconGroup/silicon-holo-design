import { useState, type ReactNode } from 'react'
interface ComponentDemoProps { id: string; title: string; description: string; children: ReactNode; compareSurfaces?: boolean }
const surfaces = [
  { label: 'Canvas', className: 'bg-surface-canvas' },
  { label: 'Base', className: 'bg-surface-base' },
  { label: 'Raised', className: 'bg-surface-raised' },
]
export function ComponentDemo({ id, title, description, children, compareSurfaces = true }: ComponentDemoProps) {
  const [surfaceIndex, setSurfaceIndex] = useState(1)
  const visibleSurfaces = compareSurfaces ? surfaces : [surfaces[1]]
  const activeSurface = visibleSurfaces[compareSurfaces ? surfaceIndex : 0]

  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="text-lg font-semibold text-content-primary mb-1">{title}</h2>
      <p className="text-sm text-content-tertiary mb-4">{description}</p>
      <div className="rounded-md border border-stroke-subtle overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stroke-muted bg-surface-inset px-3 py-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">Surface preview</span>
          {compareSurfaces && <div className="flex max-w-full flex-wrap items-center gap-0.5 rounded-sm border border-stroke-muted bg-surface-canvas p-0.5" role="group" aria-label="Preview surface">
            {surfaces.map((surface, index) => (
              <button
                key={surface.label}
                type="button"
                onClick={() => setSurfaceIndex(index)}
                aria-pressed={surfaceIndex === index}
                className={`shd-segmented-control-button shd-control-focus inline-flex h-7 min-w-12 flex-1 items-center justify-center rounded-sm border px-2 transition-colors sm:min-w-14 sm:px-2.5 ${surfaceIndex === index ? 'border-stroke-accent bg-surface-selected text-content-accent' : 'border-transparent bg-transparent text-content-tertiary hover:border-stroke-subtle hover:bg-surface-interactive hover:text-content-primary'}`}
              >
                {surface.label}
              </button>
            ))}
          </div>}
        </div>
        <div className={`${activeSurface.className} min-w-0 text-content-primary`}>
          <div className="min-h-20 overflow-auto p-4">{children}</div>
        </div>
      </div>
    </section>
  )
}
