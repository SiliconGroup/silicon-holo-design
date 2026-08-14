import { useId, useState } from 'react'
import { HoloEmpty } from '@/components/data-display/empty'
import type { HoloStudioProps } from '../types'
import { HoloActivityBar } from '../activity-bar'
import { HoloSplitPane } from '../split-pane'
import { useStudioLocale } from '../utils/use-studio-locale'

const DEFAULT_SIDE_WIDTH = 260
const MIN_SIDE_WIDTH = 180
const MAX_SIDE_WIDTH = 520

export function HoloStudio({
  panels = [],
  activePanelId,
  onActivePanelChange,
  defaultActivePanelId,
  sideCollapsed,
  onSideCollapsedChange,
  sideWidth,
  onSideWidthChange,
  minSideWidth = MIN_SIDE_WIDTH,
  maxSideWidth = MAX_SIDE_WIDTH,
  defaultSideWidth = DEFAULT_SIDE_WIDTH,
  children,
  header,
  footer,
  className = '',
}: HoloStudioProps) {
  const locale = useStudioLocale()
  const panelContainerId = useId()

  const firstTopPanel = panels.find(panel => (panel.placement ?? 'top') === 'top' && !panel.disabled)
  const [internalActiveId, setInternalActiveId] = useState<string | undefined>(defaultActivePanelId ?? firstTopPanel?.id)
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [internalWidth, setInternalWidth] = useState(defaultSideWidth)

  const resolvedActiveId = activePanelId ?? internalActiveId
  const collapsed = sideCollapsed ?? internalCollapsed
  const width = sideWidth ?? internalWidth
  const activePanel = panels.find(panel => panel.id === resolvedActiveId)

  const setActive = (id: string) => {
    if (activePanelId === undefined) setInternalActiveId(id)
    onActivePanelChange?.(id)
    if (collapsed) setCollapsed(false)
  }

  const setCollapsed = (next: boolean) => {
    if (sideCollapsed === undefined) setInternalCollapsed(next)
    onSideCollapsedChange?.(next)
  }

  const setWidth = (next: number) => {
    if (sideWidth === undefined) setInternalWidth(next)
    onSideWidthChange?.(next)
  }

  const side = (
    <aside
      key="side"
      id={panelContainerId}
      role="tabpanel"
      aria-label={activePanel?.title ?? locale.explorerTitle}
      className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-stroke-muted bg-surface-raised"
    >
      <div className="flex flex-none items-center gap-2 px-3 py-2">
        <span className="min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">
          {activePanel?.title ?? locale.explorerTitle}
        </span>
        {activePanel?.actions}
      </div>
      {/* render() 只在面板激活时调用，未激活面板不挂载。 */}
      {activePanel ? activePanel.render() : <HoloEmpty description={locale.noPanels} />}
    </aside>
  )

  const main = (
    <div key="main" className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface-canvas">
      {header}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      {footer}
    </div>
  )

  return (
    <div className={`flex h-full min-h-0 w-full overflow-hidden bg-surface-canvas ${className}`}>
      <HoloActivityBar
        items={panels}
        activeId={collapsed ? undefined : resolvedActiveId}
        panelContainerId={panelContainerId}
        onActiveChange={setActive}
        onActiveReselect={() => setCollapsed(true)}
      />
      {collapsed
        ? main
        : <HoloSplitPane
            size={width}
            onSizeChange={setWidth}
            defaultSize={defaultSideWidth}
            minSize={minSideWidth}
            maxSize={maxSideWidth}
            className="min-w-0 flex-1"
          >
            {[side, main]}
          </HoloSplitPane>}
    </div>
  )
}
