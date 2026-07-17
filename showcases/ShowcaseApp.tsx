import { ShowcaseLayout } from './ShowcaseLayout'
import { LocaleProvider, enUS } from '@/locale/index'
import { ToastProvider } from '@/components/feedback/toast'

export function ShowcaseApp() {
  return (
    <LocaleProvider locale={enUS}>
      <ToastProvider>
        <div className="relative min-h-screen bg-surface-canvas">
          <div className="fixed inset-0 -z-10 pointer-events-none" style={{
            background: `linear-gradient(rgba(0,255,255,0.018) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.018) 1px, transparent 1px),
              radial-gradient(ellipse at 50% 0%, rgba(0,180,255,0.055) 0%, transparent 52%),
              radial-gradient(ellipse at 82% 78%, rgba(80,220,170,0.025) 0%, transparent 38%),
              linear-gradient(180deg, #00080c 0%, #000d12 50%, #00080c 100%)`,
            backgroundSize: '32px 32px, 32px 32px, auto, auto, auto'
          }} />
          <ShowcaseLayout />
        </div>
      </ToastProvider>
    </LocaleProvider>
  )
}
