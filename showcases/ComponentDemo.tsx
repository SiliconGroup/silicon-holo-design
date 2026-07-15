import type { ReactNode } from 'react'
interface ComponentDemoProps { id: string; title: string; description: string; children: ReactNode }
export function ComponentDemo({ id, title, description, children }: ComponentDemoProps) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="text-lg font-semibold text-content-primary mb-1">{title}</h2>
      <p className="text-sm text-content-tertiary mb-4">{description}</p>
      <div className="rounded-md border border-stroke-subtle overflow-hidden">
        <div className="grid grid-cols-3 border-b border-stroke-muted font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">
          <div className="bg-surface-canvas px-3 py-2">Canvas</div>
          <div className="bg-surface-base px-3 py-2">Base</div>
          <div className="bg-surface-raised px-3 py-2">Raised</div>
        </div>
        <div className="relative min-h-20 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3" aria-hidden="true">
            <div className="bg-surface-canvas" />
            <div className="bg-surface-base" />
            <div className="bg-surface-raised" />
          </div>
          <div className="relative p-4">{children}</div>
        </div>
      </div>
    </section>
  )
}
