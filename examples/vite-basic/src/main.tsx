import 'virtual:uno.css'
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
        <div style={{ background: '#000a0e', minHeight: '100vh', padding: 40, color: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Silicon Holo Design — Basic Example</h1>

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
            <p>Welcome to Silicon Holo Design!</p>
          </HoloModal>
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
