import type { Artifact } from '@/types'

export function SvgRenderer({ artifact }: { artifact: Artifact }) {
  return <div className="flex h-full w-full items-center justify-center rounded bg-surface-interactive p-4"><div dangerouslySetInnerHTML={{ __html: artifact.content }} className="flex h-full w-full items-center justify-center [&_svg]:max-h-full [&_svg]:max-w-full" /></div>
}
