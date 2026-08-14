import type { ReactNode } from 'react'
import type { HoloGitPanelProps, HoloStudioPanel } from '../types'
import { HoloGitPanel } from '../git-panel'

const gitIcon = (
  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4.5 3.5v5.25a2 2 0 0 0 2 2H10M4.5 3.5a1.5 1.5 0 1 0 0-.02M11.5 12.5a1.5 1.5 0 1 0 0-.02M11.5 5.5a1.5 1.5 0 1 0 0-.02" />
  </svg>
)

export interface CreateGitPanelOptions {
  /** 直接透传给 HoloGitPanel。 */
  git: HoloGitPanelProps
  /** 面板标题。省略时使用英文默认值，与库内 StatusIndicator 的约定一致。 */
  title?: string
  icon?: ReactNode
  /** 默认 'git'。 */
  id?: string
  /** 省略时自动取「变更条目总数」。传 null 可显式关闭角标。 */
  badge?: string | number | null
  actions?: ReactNode
  placement?: 'top' | 'bottom'
  disabled?: boolean
}

/** 内置 Git 面板工厂。返回值与下游手写的 HoloStudioPanel 完全同构。 */
export function createGitPanel(options: CreateGitPanelOptions): HoloStudioPanel {
  const { git, title, icon, id = 'git', badge, actions, placement, disabled } = options
  const resolvedBadge = badge === undefined
    ? (git.changes.length > 0 ? git.changes.length : undefined)
    : (badge === null ? undefined : badge)
  return {
    id,
    icon: icon ?? gitIcon,
    title: title ?? 'Source Control',
    render: () => <HoloGitPanel {...git} />,
    ...(resolvedBadge !== undefined ? { badge: resolvedBadge } : {}),
    ...(actions !== undefined ? { actions } : {}),
    ...(placement !== undefined ? { placement } : {}),
    ...(disabled !== undefined ? { disabled } : {}),
  }
}
