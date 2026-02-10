import type { ReactNode } from 'react'
interface ComponentDemoProps { id: string; title: string; description: string; children: ReactNode }
export function ComponentDemo({ id, title, description, children }: ComponentDemoProps) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="text-lg font-semibold text-white/90 mb-1">{title}</h2>
      <p className="text-sm text-white/50 mb-4">{description}</p>
      <div className="p-4 rounded-md border border-holo-cyan/15 bg-scene-deep/50">{children}</div>
    </section>
  )
}
