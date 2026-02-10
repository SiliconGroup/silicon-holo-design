import type { ComponentPropsWithoutRef } from 'react'
export function CodeBlock({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) {
  return <code className={className} {...props}>{children}</code>
}
