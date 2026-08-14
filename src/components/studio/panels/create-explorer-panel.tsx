import type { ReactNode } from 'react'
import type { HoloStudioPanel, HoloTreeProps } from '../types'
import { HoloTree } from '../tree'

const explorerIcon = (
  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 3.75a1 1 0 0 1 1-1h3.1a1 1 0 0 1 .74.33l.82.92h5.34a1 1 0 0 1 1 1v7.25a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
  </svg>
)

export interface CreateExplorerPanelOptions {
  /** 直接透传给 HoloTree。 */
  tree: HoloTreeProps
  /**
   * 面板标题。省略时使用英文默认值 'Explorer'。
   *
   * 工厂是纯函数、不能使用 hook，因此无法在此读取 LocaleProvider 的上下文。
   * 这与库内 StatusIndicator「默认英文标签、可通过 props 覆盖」的既有约定一致；
   * 需要本地化时由宿主传入 locale.studio.explorerTitle。
   */
  title?: string
  icon?: ReactNode
  /** 默认 'explorer'。 */
  id?: string
  badge?: string | number
  actions?: ReactNode
  placement?: 'top' | 'bottom'
  disabled?: boolean
}

/**
 * 内置资源管理面板工厂。返回值与下游手写的 HoloStudioPanel 完全同构，
 * 因此可以被重排、替换或整体删除，无需任何额外配置项。
 */
export function createExplorerPanel(options: CreateExplorerPanelOptions): HoloStudioPanel {
  const { tree, title, icon, id = 'explorer', badge, actions, placement, disabled } = options
  return {
    id,
    icon: icon ?? explorerIcon,
    title: title ?? 'Explorer',
    render: () => <HoloTree {...tree} />,
    ...(badge !== undefined ? { badge } : {}),
    ...(actions !== undefined ? { actions } : {}),
    ...(placement !== undefined ? { placement } : {}),
    ...(disabled !== undefined ? { disabled } : {}),
  }
}
