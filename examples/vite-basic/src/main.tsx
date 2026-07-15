import 'virtual:uno.css'
import '../../../src/styles/base.css'
import '../../../src/styles/animations.css'
import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import {
  LocaleProvider, enUS, zhCN, ToastProvider, useToast,
  HoloButton, HoloInput, HoloModal, HoloAlert, HoloTag, HoloSwitch,
  HoloSelect, HoloSpace, HoloDivider, HoloProgress, HoloSpinner,
} from '../../../src'
import type { Locale } from '../../../src'

function App() {
  const [locale, setLocale] = useState<Locale>(enUS)
  const [modalOpen, setModalOpen] = useState(false)
  const [switchOn, setSwitchOn] = useState(false)
  const [selectValue, setSelectValue] = useState('')

  return (
    <LocaleProvider locale={locale}>
      <ToastProvider>
        <div className="relative min-h-screen overflow-hidden bg-surface-canvas text-content-primary">
          <div aria-hidden="true" className="pointer-events-none fixed inset-0" style={{
            background: 'linear-gradient(rgba(0,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.016) 1px, transparent 1px), radial-gradient(ellipse at 50% 0%, rgba(0,136,255,0.065), transparent 45%)',
            backgroundSize: '32px 32px, 32px 32px, auto',
          }} />
          <main className="relative mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10 lg:px-10">
          <header className="overflow-hidden rounded-md border border-stroke-subtle bg-surface-raised px-6 py-5">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-content-accent">Reference Integration</p>
            <h1 className="holo-text m-0 text-2xl font-bold">Silicon Holo Design</h1>
            <p className="mt-2 text-sm text-content-tertiary">Deep-space surfaces, neutral structure, local spectral response.</p>
          </header>

          <HoloSpace size="md">
            <HoloButton onClick={() => setLocale(enUS)}>English</HoloButton>
            <HoloButton onClick={() => setLocale(zhCN)}>中文</HoloButton>
          </HoloSpace>

          <HoloDivider label="Buttons" />
          <HoloSpace wrap>
            <HoloButton variant="primary">Primary</HoloButton>
            <HoloButton variant="secondary">Secondary</HoloButton>
            <HoloButton variant="ghost">Ghost</HoloButton>
            <HoloButton variant="success">Success</HoloButton>
            <HoloButton variant="danger">Danger</HoloButton>
            <HoloButton disabled>Disabled</HoloButton>
          </HoloSpace>

          <HoloDivider label="Form" />
          <HoloSpace direction="vertical" size="md">
            <HoloInput placeholder="Type something..." />
            <HoloSelect options={[{value:'a',label:'React'},{value:'b',label:'Vue'},{value:'c',label:'Svelte'}]} value={selectValue} onChange={(v) => setSelectValue(v as string)} />
            <HoloSwitch checked={switchOn} onChange={setSwitchOn} label="Toggle me" />
          </HoloSpace>

          <HoloDivider label="Feedback" />
          <HoloSpace direction="vertical" size="md">
            <HoloAlert type="info" title="This is an info alert" />
            <HoloAlert type="success" title="Operation successful" />
            <HoloProgress percent={65} />
            <HoloSpace>
              <HoloTag color="cyan">Cyan</HoloTag>
              <HoloTag color="green">Green</HoloTag>
              <HoloTag color="purple">Purple</HoloTag>
            </HoloSpace>
            <HoloButton onClick={() => setModalOpen(true)}>Open Modal</HoloButton>
            <ToastDemo />
          </HoloSpace>

          <HoloModal open={modalOpen} onClose={() => setModalOpen(false)} title="Hello" closable>
            <p className="text-content-secondary">Welcome to the spectral-flat Silicon Holo interface.</p>
          </HoloModal>
          </main>
        </div>
      </ToastProvider>
    </LocaleProvider>
  )
}

function ToastDemo() {
  const toast = useToast()
  return (
    <HoloSpace>
      <HoloButton variant="success" onClick={() => toast.success('Saved!')}>Toast Success</HoloButton>
      <HoloButton variant="danger" onClick={() => toast.error('Failed!')}>Toast Error</HoloButton>
    </HoloSpace>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
