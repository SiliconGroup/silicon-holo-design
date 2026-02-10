import { useState, useEffect } from 'react'
import FormSection from './sections/FormSection'
import DataSection from './sections/DataSection'
import FeedbackSection from './sections/FeedbackSection'
import NavSection from './sections/NavSection'
import LayoutSection from './sections/LayoutSection'

interface NavItem {
  id: string
  title: string
}

interface NavCategory {
  title: string
  items: NavItem[]
}

const navCategories: NavCategory[] = [
  {
    title: 'Form (表单)',
    items: [
      { id: 'button', title: 'HoloButton' },
      { id: 'input', title: 'HoloInput' },
      { id: 'textarea', title: 'HoloTextarea' },
      { id: 'select', title: 'HoloSelect' },
      { id: 'checkbox', title: 'HoloCheckbox' },
      { id: 'radio', title: 'HoloRadio' },
      { id: 'switch', title: 'HoloSwitch' },
      { id: 'slider', title: 'HoloSlider' },
      { id: 'number-input', title: 'HoloNumberInput' },
      { id: 'upload', title: 'HoloUpload' },
      { id: 'date-picker', title: 'HoloDatePicker' },
      { id: 'form', title: 'HoloForm' },
    ]
  },
  {
    title: 'Data Display (数据展示)',
    items: [
      { id: 'badge', title: 'HoloBadge' },
      { id: 'tag', title: 'HoloTag' },
      { id: 'avatar', title: 'HoloAvatar' },
      { id: 'tooltip', title: 'HoloTooltip' },
      { id: 'popover', title: 'HoloPopover' },
      { id: 'table', title: 'HoloTable' },
      { id: 'empty', title: 'HoloEmpty' },
      { id: 'timeline', title: 'HoloTimeline' },
      { id: 'descriptions', title: 'HoloDescriptions' },
      { id: 'kbd', title: 'HoloKbd' },
      { id: 'glow-card', title: 'GlowCard' },
      { id: 'status-indicator', title: 'StatusIndicator' },
    ]
  },
  {
    title: 'Feedback (反馈)',
    items: [
      { id: 'modal', title: 'HoloModal' },
      { id: 'drawer', title: 'HoloDrawer' },
      { id: 'confirm', title: 'HoloConfirm' },
      { id: 'alert', title: 'HoloAlert' },
      { id: 'progress', title: 'HoloProgress' },
      { id: 'skeleton', title: 'HoloSkeleton' },
      { id: 'spinner', title: 'HoloSpinner' },
      { id: 'hexagon-loader', title: 'HexagonLoader' },
    ]
  },
  {
    title: 'Navigation (导航)',
    items: [
      { id: 'breadcrumb', title: 'HoloBreadcrumb' },
      { id: 'pagination', title: 'HoloPagination' },
      { id: 'steps', title: 'HoloSteps' },
      { id: 'dropdown', title: 'HoloDropdown' },
      { id: 'anchor', title: 'HoloAnchor' },
      { id: 'tabs', title: 'HoloTab' },
      { id: 'link', title: 'HoloLink' },
    ]
  },
  {
    title: 'Layout (布局)',
    items: [
      { id: 'divider', title: 'HoloDivider' },
      { id: 'space', title: 'HoloSpace' },
      { id: 'scroll-area', title: 'HoloScrollArea' },
      { id: 'collapse', title: 'HoloCollapse' },
      { id: 'circuit-border', title: 'CircuitBorder' },
    ]
  }
]

export function ShowcaseLayout() {
  const [activeSection, setActiveSection] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const scrollToComponent = (componentId: string) => {
    const el = document.getElementById(componentId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(componentId)
    }
    setSidebarOpen(false)
  }

  useEffect(() => {
    const content = document.getElementById('showcase-content')
    if (!content) return
    const allIds = navCategories.flatMap(c => c.items.map(i => i.id))
    const onScroll = () => {
      for (const id of allIds) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top >= 0 && rect.top < 300) {
            setActiveSection(id)
            break
          }
        }
      }
    }
    content.addEventListener('scroll', onScroll, { passive: true })
    return () => content.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="relative flex h-screen">
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 flex-center rounded border border-holo-cyan/30 hover:border-holo-cyan/50 bg-scene-void/90 backdrop-blur-sm text-white/50 hover:text-holo-cyan transition-colors duration-200"
      >
        <span className="i-carbon-menu text-lg" />
      </button>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 w-60 flex-shrink-0
        bg-scene-deep/95 border-r border-holo-cyan/15 backdrop-blur-sm
        h-screen overflow-y-auto transition-transform duration-250
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-5 pb-3">
          <h1 className="text-xl font-bold holo-text">Silicon Holo</h1>
          <p className="text-xs text-white/30 mt-1">Component Library</p>
        </div>
        <nav className="px-3 pb-6">
          {navCategories.map((cat) => (
            <div key={cat.title}>
              <h3 className="text-xs text-white/30 uppercase tracking-wider mb-1 mt-4 px-2">{cat.title}</h3>
              {cat.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToComponent(item.id)}
                  className={`text-sm py-1.5 pl-3 block w-full text-left rounded-sm transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'text-holo-cyan bg-holo-cyan/8 border-l-2 border-holo-cyan'
                      : 'text-white/50 hover:text-holo-cyan/70 hover:bg-holo-cyan/5 border-l-2 border-transparent'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main id="showcase-content" className="flex-1 min-w-0 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="text-center py-8 mb-8">
            <h1 className="text-3xl font-bold holo-text mb-3">Silicon Holo Components</h1>
            <p className="text-white/50 text-sm max-w-xl mx-auto">全息科技风 UI 组件库 — React + TypeScript + UnoCSS</p>
          </div>

          <div className="space-y-16">
            <section>
              <h2 className="text-xl font-semibold holo-text mb-6 pb-2 border-b border-holo-cyan/15">Form (表单)</h2>
              <FormSection />
            </section>
            <section>
              <h2 className="text-xl font-semibold holo-text mb-6 pb-2 border-b border-holo-cyan/15">Data Display (数据展示)</h2>
              <DataSection />
            </section>
            <section>
              <h2 className="text-xl font-semibold holo-text mb-6 pb-2 border-b border-holo-cyan/15">Feedback (反馈)</h2>
              <FeedbackSection />
            </section>
            <section>
              <h2 className="text-xl font-semibold holo-text mb-6 pb-2 border-b border-holo-cyan/15">Navigation (导航)</h2>
              <NavSection />
            </section>
            <section>
              <h2 className="text-xl font-semibold holo-text mb-6 pb-2 border-b border-holo-cyan/15">Layout (布局)</h2>
              <LayoutSection />
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
