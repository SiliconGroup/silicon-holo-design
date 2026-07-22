import { HoloSpinner } from '@/components/feedback/spinner'

export function RendererLoading({ label = 'Loading preview' }: { label?: string }) {
  return <div className="flex h-full min-h-48 items-center justify-center gap-3 text-sm text-content-tertiary"><HoloSpinner size="sm" /><span>{label}</span></div>
}

export function RendererError({ message }: { message: string }) {
  return <div role="alert" className="m-4 rounded-md border border-stroke-error bg-state-error-soft p-4 text-sm text-status-error">{message}</div>
}
