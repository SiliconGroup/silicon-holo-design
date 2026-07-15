import 'virtual:uno.css'
import '../../../src/styles/base.css'
import '../../../src/styles/animations.css'
import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import {
  LocaleProvider, ThemeProvider, enUS, zhCN, ToastProvider, useToast,
  HoloButton, HoloInput, HoloTextarea, HoloSelect, HoloCheckbox, HoloRadio, HoloRadioGroup,
  HoloSwitch, HoloSlider, HoloNumberInput, HoloDatePicker,
  HoloModal, HoloDrawer, HoloConfirm, HoloAlert, HoloProgress, HoloSkeleton, HoloSpinner, HexagonLoader,
  HoloTable, HoloTag, HoloBadge, HoloAvatar, HoloTooltip, HoloPopover, HoloTimeline, HoloEmpty, HoloKbd,
  HoloBreadcrumb, HoloPagination, HoloSteps, HoloDropdown, HoloTab,
  HoloDivider, HoloSpace, HoloCollapse, GlowCard, CircuitBorder, IconButton, HoloLink,
  StatusIndicator,
} from '../../../src'
import type { Locale } from '../../../src'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 flex items-center gap-3 border-b border-stroke-subtle pb-2 text-lg font-semibold text-content-primary">
        <span className="h-1.5 w-1.5 rotate-45 border border-stroke-accent bg-accent-primary-soft" />
        {title}
      </h2>
      <div className="flex flex-col gap-4 overflow-hidden rounded-md border border-stroke-subtle bg-surface-base p-5">
        {children}
      </div>
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>
}

function App() {
  const [locale, setLocale] = useState<Locale>(enUS)
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [switchOn, setSwitchOn] = useState(false)
  const [checkboxOn, setCheckboxOn] = useState(false)
  const [radioVal, setRadioVal] = useState('a')
  const [sliderVal, setSliderVal] = useState(40)
  const [numberVal, setNumberVal] = useState(5)
  const [selectVal, setSelectVal] = useState('')
  const [page, setPage] = useState(1)
  const [step, setStep] = useState(1)
  const [tab, setTab] = useState('tab1')

  return (
    <LocaleProvider locale={locale}>
      <ToastProvider>
        <div className="relative min-h-screen overflow-hidden bg-surface-canvas text-content-primary">
          <div aria-hidden="true" className="pointer-events-none fixed inset-0" style={{
            background: 'linear-gradient(rgba(0,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.016) 1px, transparent 1px), radial-gradient(ellipse at 18% 0%, rgba(0,136,255,0.06), transparent 42%), radial-gradient(ellipse at 88% 72%, rgba(170,136,255,0.035), transparent 34%)',
            backgroundSize: '32px 32px, 32px 32px, auto, auto',
          }} />
          <div className="relative mx-auto max-w-5xl px-6 py-10 lg:px-12">
          {/* Header */}
          <div className="mb-10 flex items-center gap-4 border-b border-stroke-subtle pb-6">
            <img src="/logo.svg" alt="logo" style={{ height: 32 }} />
            <div>
              <h1 className="holo-text text-2xl font-bold">Component Gallery</h1>
              <p className="mt-1 text-xs text-content-tertiary">Spectral-flat components and interaction states</p>
            </div>
            <div className="ml-auto">
              <HoloSpace size="sm">
                <HoloButton size="sm" variant={locale === enUS ? 'primary' : 'ghost'} onClick={() => setLocale(enUS)}>EN</HoloButton>
                <HoloButton size="sm" variant={locale === zhCN ? 'primary' : 'ghost'} onClick={() => setLocale(zhCN)}>中文</HoloButton>
              </HoloSpace>
            </div>
          </div>

          {/* General */}
          <Section title="General">
            <Row>
              <HoloButton variant="primary">Primary</HoloButton>
              <HoloButton variant="secondary">Secondary</HoloButton>
              <HoloButton variant="ghost">Ghost</HoloButton>
              <HoloButton variant="success">Success</HoloButton>
              <HoloButton variant="danger">Danger</HoloButton>
              <HoloButton disabled>Disabled</HoloButton>
              <HoloButton size="sm">Small</HoloButton>
              <HoloButton size="lg">Large</HoloButton>
            </Row>
            <Row>
              <IconButton onClick={() => {}}>⚙</IconButton>
              <HoloLink href="#">Holo Link →</HoloLink>
            </Row>
            <Row>
              <GlowCard className="p-4 w-50">GlowCard content</GlowCard>
              <CircuitBorder className="p-4 w-50">CircuitBorder content</CircuitBorder>
            </Row>
          </Section>

          {/* Data Entry */}
          <Section title="Data Entry">
            <Row>
              <HoloInput placeholder="Text input..." style={{ width: 220 }} />
              <HoloInput placeholder="Disabled" disabled style={{ width: 220 }} />
            </Row>
            <HoloTextarea placeholder="Textarea..." rows={3} />
            <Row>
              <HoloSelect options={[{ value: 'react', label: 'React' }, { value: 'vue', label: 'Vue' }, { value: 'svelte', label: 'Svelte' }]} value={selectVal} onChange={v => setSelectVal(v as string)} />
              <HoloDatePicker value="" onChange={() => {}} />
              <HoloNumberInput value={numberVal} onChange={setNumberVal} min={0} max={100} />
            </Row>
            <Row>
              <HoloCheckbox checked={checkboxOn} onChange={setCheckboxOn} label="Checkbox" />
              <HoloSwitch checked={switchOn} onChange={setSwitchOn} label="Switch" />
            </Row>
            <HoloRadioGroup
              options={[{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }, { value: 'c', label: 'Option C' }]}
              value={radioVal}
              onChange={setRadioVal}
            />
            <HoloSlider value={sliderVal} onChange={setSliderVal} min={0} max={100} />
          </Section>

          {/* Data Display */}
          <Section title="Data Display">
            <Row>
              <HoloTag color="cyan">Cyan</HoloTag>
              <HoloTag color="green">Green</HoloTag>
              <HoloTag color="purple">Purple</HoloTag>
              <HoloTag color="error">Error</HoloTag>
              <HoloBadge count={5}><HoloButton size="sm">Notifications</HoloButton></HoloBadge>
            </Row>
            <Row>
              <HoloAvatar alt="Alice" size="sm" />
              <HoloAvatar alt="Bob" size="md" />
              <HoloAvatar alt="Charlie" size="lg" />
              <StatusIndicator status="connected" />
              <StatusIndicator status="connecting" />
              <StatusIndicator status="disconnected" />
            </Row>
            <Row>
              <HoloTooltip content="Tooltip text"><HoloButton variant="ghost">Hover me</HoloButton></HoloTooltip>
              <HoloPopover content={<div style={{ padding: 8 }}>Popover content</div>}><HoloButton variant="ghost">Click me</HoloButton></HoloPopover>
              <HoloKbd>⌘</HoloKbd><HoloKbd>K</HoloKbd>
            </Row>
            <HoloTable
              columns={[{ key: 'name', title: 'Name' }, { key: 'role', title: 'Role' }, { key: 'status', title: 'Status' }]}
              data={[{ name: 'Alice', role: 'Engineer', status: 'Active' }, { name: 'Bob', role: 'Designer', status: 'Away' }]}
              rowKey="name"
            />
            <HoloTimeline items={[{ title: 'Step 1', description: 'Initialize' }, { title: 'Step 2', description: 'Configure' }, { title: 'Step 3', description: 'Deploy' }]} />
            <HoloCollapse items={[{ key: '1', title: 'Section A', content: 'Content A' }, { key: '2', title: 'Section B', content: 'Content B' }]} />
            <HoloEmpty />
          </Section>

          {/* Feedback */}
          <Section title="Feedback">
            <Row>
              <HoloAlert type="info" title="Info alert" />
              <HoloAlert type="success" title="Success alert" />
              <HoloAlert type="warning" title="Warning alert" />
              <HoloAlert type="error" title="Error alert" />
            </Row>
            <HoloProgress percent={65} />
            <Row>
              <HoloSkeleton loading={true} rows={2}><div /></HoloSkeleton>
              <HoloSpinner size="sm" />
              <HexagonLoader size={40} />
            </Row>
            <Row>
              <HoloButton onClick={() => setModalOpen(true)}>Open Modal</HoloButton>
              <HoloButton onClick={() => setDrawerOpen(true)}>Open Drawer</HoloButton>
              <HoloButton onClick={() => setConfirmOpen(true)}>Open Confirm</HoloButton>
              <ToastDemo />
            </Row>
            <HoloModal open={modalOpen} onClose={() => setModalOpen(false)} title="Modal Title" closable><p>Modal body content.</p></HoloModal>
            <HoloDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Drawer Title"><p>Drawer body content.</p></HoloDrawer>
            <HoloConfirm open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={() => setConfirmOpen(false)} title="Confirm" description="Are you sure?" />
          </Section>

          {/* Navigation */}
          <Section title="Navigation">
            <HoloBreadcrumb items={[{ label: 'Home', href: '#' }, { label: 'Components', href: '#' }, { label: 'Button' }]} />
            <HoloTab items={[{ key: 'tab1', label: 'Overview' }, { key: 'tab2', label: 'API' }, { key: 'tab3', label: 'Examples' }]} activeKey={tab} onChange={setTab} />
            <HoloSteps current={step} items={[{ title: 'Setup' }, { title: 'Configure' }, { title: 'Deploy' }]} />
            <Row>
              <HoloButton size="sm" onClick={() => setStep(s => Math.max(0, s - 1))}>Prev Step</HoloButton>
              <HoloButton size="sm" onClick={() => setStep(s => Math.min(2, s + 1))}>Next Step</HoloButton>
            </Row>
            <HoloPagination current={page} total={100} pageSize={10} onChange={setPage} />
            <HoloDropdown items={[{ key: 'a', label: 'Action A' }, { key: 'b', label: 'Action B' }, { key: 'c', label: 'Action C' }]} onSelect={() => {}}><HoloButton variant="ghost">Dropdown ▾</HoloButton></HoloDropdown>
          </Section>

          {/* Layout */}
          <Section title="Layout">
            <HoloDivider label="Divider with label" />
            <HoloSpace size="md" wrap>
              <HoloButton>Spaced A</HoloButton>
              <HoloButton>Spaced B</HoloButton>
              <HoloButton>Spaced C</HoloButton>
            </HoloSpace>
          </Section>
          </div>
        </div>
      </ToastProvider>
    </LocaleProvider>
  )
}

function ToastDemo() {
  const toast = useToast()
  return (
    <HoloSpace size="sm">
      <HoloButton variant="success" onClick={() => toast.success('Saved!')}>Toast ✓</HoloButton>
      <HoloButton variant="danger" onClick={() => toast.error('Failed!')}>Toast ✗</HoloButton>
    </HoloSpace>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
