import type { HoloFileTab } from '../types'

/**
 * 预览标签 / 固定标签的状态机。
 *
 * 这是编辑器里的事实标准（VS Code、JetBrains 的 preview tab）：
 *
 * - 单击文件 → 打开**预览标签**（斜体）。同一时刻至多一个预览标签。
 * - 再单击别的文件 → **原地替换**那个预览标签，不新开。
 * - 双击文件、双击标签，或该文件被编辑 → 预览标签**固定**下来，
 *   之后单击别的文件会新开一个预览标签。
 * - 预览位与「当前激活的是哪个标签」无关：即使当前停在某个固定标签上，
 *   单击新文件仍然替换那个已存在的预览标签。
 *
 * 标签状态由宿主拥有（`tabs` 是受控的），所以这里是一组**纯函数**，
 * 宿主直接把结果塞回自己的 state 即可，不需要自己重新推导这套规则。
 */
export interface HoloFileTabsState {
  tabs: HoloFileTab[]
  activeId?: string
}

/**
 * 打开一个文件。
 *
 * - 已经打开 → 只切换激活，不改动该标签的固定状态（不会把固定标签降级成预览）。
 * - 未打开且存在预览标签 → 原地替换它。
 * - 未打开且没有预览标签 → 追加。
 *
 * `options.pinned` 为 true 时直接以固定标签打开（对应双击手势）。
 */
export function openTab(
  state: HoloFileTabsState,
  tab: HoloFileTab,
  options: { pinned?: boolean } = {},
): HoloFileTabsState {
  const existingIndex = state.tabs.findIndex(candidate => candidate.id === tab.id)
  if (existingIndex >= 0) {
    const existing = state.tabs[existingIndex]
    // 双击已存在的预览标签 = 固定它
    const tabs = options.pinned && existing.preview === true
      ? state.tabs.map((candidate, index) => (index === existingIndex ? { ...candidate, preview: false } : candidate))
      : state.tabs
    return { tabs, activeId: tab.id }
  }

  const next: HoloFileTab = options.pinned === true ? { ...tab, preview: false } : { ...tab, preview: true }
  if (options.pinned === true) return { tabs: [...state.tabs, next], activeId: tab.id }

  const previewIndex = state.tabs.findIndex(candidate => candidate.preview === true)
  const tabs = previewIndex >= 0
    ? state.tabs.map((candidate, index) => (index === previewIndex ? next : candidate))
    : [...state.tabs, next]
  return { tabs, activeId: tab.id }
}

/** 固定一个标签。已固定或不存在时原样返回。 */
export function pinTab(state: HoloFileTabsState, id: string): HoloFileTabsState {
  if (!state.tabs.some(tab => tab.id === id && tab.preview === true)) return state
  return { ...state, tabs: state.tabs.map(tab => (tab.id === id ? { ...tab, preview: false } : tab)) }
}

/**
 * 关闭一个标签，并在关闭的是当前激活项时把激活位交给邻居
 * （优先右侧，没有则左侧），与编辑器的通行行为一致。
 */
export function closeTab(state: HoloFileTabsState, id: string): HoloFileTabsState {
  const index = state.tabs.findIndex(tab => tab.id === id)
  if (index < 0) return state
  const tabs = state.tabs.filter(tab => tab.id !== id)
  if (state.activeId !== id) return { tabs, activeId: state.activeId }
  const neighbour = tabs[index] ?? tabs[index - 1]
  return { tabs, ...(neighbour ? { activeId: neighbour.id } : {}) }
}
