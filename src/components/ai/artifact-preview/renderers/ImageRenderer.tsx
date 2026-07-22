import type { Artifact } from '@/types'

export function ImageRenderer({ artifact }: { artifact: Artifact }) {
  return <div className="flex h-full w-full items-center justify-center p-4"><img src={artifact.content} alt={artifact.title || 'Image'} className="max-h-full max-w-full rounded object-contain" /></div>
}
