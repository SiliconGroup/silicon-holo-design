import { useState, type ComponentPropsWithoutRef, type ReactNode } from 'react'

function getPlainText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(getPlainText).join('')
  return ''
}

export function CodeBlock({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getPlainText(children))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="max-w-full overflow-hidden rounded-md border border-stroke-subtle bg-surface-raised">
      <div className="flex items-center justify-between border-b border-stroke-muted bg-surface-base px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">Code</span>
        <button
          type="button"
          onClick={handleCopy}
          className="border-none rounded px-2 py-1 text-xs text-content-tertiary transition-colors duration-150 hover:bg-surface-interactive hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          aria-label={copied ? 'Code copied' : 'Copy code'}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <code
        className={`block max-w-full overflow-x-auto px-4 py-3 font-mono text-sm leading-relaxed text-content-primary ${className ?? ''}`}
        {...props}
      >
        {children}
      </code>
    </div>
  )
}
