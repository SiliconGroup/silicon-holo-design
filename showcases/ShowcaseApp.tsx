import { ShowcaseLayout } from './ShowcaseLayout'
import { LocaleProvider, enUS } from '@/locale/index'
import { ToastProvider } from '@/components/feedback/toast'

export function ShowcaseApp() {
  return (
    <LocaleProvider locale={enUS}>
      <ToastProvider>
        <div className="relative min-h-screen bg-scene-void">
          <div className="fixed inset-0 -z-10 pointer-events-none" style={{
            background: `radial-gradient(ellipse at 50% 0%, rgba(0,255,255,0.04) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(0,255,170,0.025) 0%, transparent 40%),
              linear-gradient(180deg, #000a0e 0%, #001018 50%, #000a0e 100%)`
          }} />
          <ShowcaseLayout />
        </div>
      </ToastProvider>
    </LocaleProvider>
  )
}
