import type { CSSProperties } from 'react'
import { ComponentDemo } from '../ComponentDemo'
import { ToolExecutionCard } from '@/index'

const surfaceRoles = [
  ['Canvas', 'bg-surface-canvas'],
  ['Base', 'bg-surface-base'],
  ['Base Soft', 'bg-surface-base-soft'],
  ['Raised', 'bg-surface-raised'],
  ['Raised Soft', 'bg-surface-raised-soft'],
  ['Overlay', 'bg-surface-overlay'],
  ['Glass', 'bg-surface-glass'],
  ['Inset', 'bg-surface-inset'],
  ['Interactive', 'bg-surface-interactive'],
  ['Selected', 'bg-surface-selected'],
]

const strokeRoles = [
  ['Muted', 'border-stroke-muted'],
  ['Subtle', 'border-stroke-subtle'],
  ['Default', 'border-stroke-default'],
  ['Strong', 'border-stroke-strong'],
  ['Accent', 'border-stroke-accent'],
]

export default function FoundationsSection() {
  return (
    <div className="space-y-8">
      <ComponentDemo id="foundations" title="Foundations" description="Semantic surfaces, strokes, content, accent, and status roles form the visual contract">
        <div className="space-y-5">
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {surfaceRoles.map(([label, className]) => (
              <div key={label} className={`h-20 rounded border border-stroke-subtle p-2 ${className}`}>
                <span className="font-mono text-[10px] uppercase tracking-wider text-content-secondary">{label}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-5">
            {strokeRoles.map(([label, className]) => (
              <div key={label} className={`rounded border bg-surface-base px-3 py-4 text-center text-xs text-content-secondary ${className}`}>{label}</div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="text-content-primary">Primary text</span>
            <span className="text-content-secondary">Secondary text</span>
            <span className="text-content-tertiary">Tertiary text</span>
            <span className="text-content-accent">Accent text</span>
            <span className="text-status-success">Success</span>
            <span className="text-status-warning">Warning</span>
            <span className="text-status-error">Error</span>
          </div>
        </div>
      </ComponentDemo>

      <ComponentDemo id="materials" title="Surface Materials" description="Deep-space solids, spectral thin films, inset technical surfaces, and restrained glass overlays remain visually distinct">
        <div className="rounded-md border border-stroke-muted bg-[linear-gradient(rgba(0,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.035)_1px,transparent_1px)] bg-[size:28px_28px] p-5">
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="rounded-md border border-stroke-subtle bg-surface-base p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-content-tertiary">Solid base</div>
              <div className="mt-3 text-sm text-content-secondary">Stable deep-space foundation</div>
            </div>
            <div className="shd-spectral-panel rounded-md border border-stroke-subtle p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-content-tertiary">Thin film</div>
              <div className="mt-3 text-sm text-content-secondary">Low-fill cyan and violet response</div>
            </div>
            <div className="shd-surface-inset rounded-md border border-stroke-muted p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-content-tertiary">Inset</div>
              <div className="mt-3 text-sm text-content-secondary">Payloads, code, and dense details</div>
            </div>
            <div className="shd-spectral-glass rounded-md border border-stroke-default p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-content-tertiary">Glass overlay</div>
              <div className="mt-3 text-sm text-content-secondary">Floating layers only</div>
            </div>
          </div>
        </div>
      </ComponentDemo>

      <ComponentDemo id="compatibility" title="Compatibility" description="Legacy public classes, CSS variables, and deprecated aliases remain consumable">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded border border-stroke-subtle bg-surface-base p-4">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-content-tertiary">Legacy class</div>
            <div className="holo-text text-lg font-semibold">.holo-text</div>
          </div>
          <div
            className="rounded border border-stroke-subtle bg-surface-base p-4"
            style={{ '--holo-cyan': '#66eaff' } as CSSProperties}
          >
            <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-content-tertiary">Legacy variable</div>
            <span className="font-mono text-sm" style={{ color: 'var(--holo-cyan)' }}>--holo-cyan</span>
          </div>
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-content-tertiary">Deprecated alias</div>
            <ToolExecutionCard toolName="legacy_alias_check" status="complete" result="ToolExecutionCard → AIToolExecutionCard" />
          </div>
        </div>
      </ComponentDemo>
    </div>
  )
}
