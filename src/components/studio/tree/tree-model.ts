import type { HoloTreeNode } from '../types'

export interface HoloTreeRow {
  node: HoloTreeNode
  /** 0 起的层级深度。 */
  depth: number
  /** 该节点是否有已知子节点。 */
  hasChildren: boolean
}

export interface TreeWindow {
  start: number
  end: number
  paddingTop: number
  paddingBottom: number
}

/**
 * 由扁平节点数组与展开集合计算可见行。
 * 同层顺序即 nodes 数组中的相对顺序——组件不排序。
 */
export function buildVisibleRows(nodes: HoloTreeNode[], expandedIds: Iterable<string>): HoloTreeRow[] {
  const expanded = expandedIds instanceof Set ? expandedIds : new Set(expandedIds)
  const byParent = new Map<string, HoloTreeNode[]>()
  const known = new Set<string>()
  for (const node of nodes) known.add(node.id)
  for (const node of nodes) {
    // parentId 指向不存在的节点时按根节点处理，避免宿主分片加载时整棵树消失。
    const key = node.parentId !== undefined && known.has(node.parentId) ? node.parentId : ''
    const bucket = byParent.get(key)
    if (bucket) bucket.push(node)
    else byParent.set(key, [node])
  }

  const rows: HoloTreeRow[] = []
  const visiting = new Set<string>()
  const walk = (parentKey: string, depth: number) => {
    const children = byParent.get(parentKey)
    if (!children) return
    for (const node of children) {
      if (visiting.has(node.id)) continue
      const grandChildren = byParent.get(node.id)
      rows.push({ node, depth, hasChildren: Boolean(grandChildren && grandChildren.length > 0) })
      if (node.kind !== 'branch' || !expanded.has(node.id)) continue
      visiting.add(node.id)
      walk(node.id, depth + 1)
      visiting.delete(node.id)
    }
  }
  walk('', 0)
  return rows
}

/** 固定行高的窗口计算。overscan 以行数计。 */
export function computeWindow(
  scrollTop: number,
  viewportHeight: number,
  rowHeight: number,
  total: number,
  overscan = 8,
): TreeWindow {
  if (total <= 0 || rowHeight <= 0) return { start: 0, end: 0, paddingTop: 0, paddingBottom: 0 }
  const safeTop = Math.max(0, scrollTop)
  const visibleCount = viewportHeight > 0 ? Math.ceil(viewportHeight / rowHeight) + 1 : total
  const start = Math.max(0, Math.floor(safeTop / rowHeight) - overscan)
  const end = Math.min(total, start + visibleCount + overscan * 2)
  return {
    start,
    end,
    paddingTop: start * rowHeight,
    paddingBottom: Math.max(0, (total - end) * rowHeight),
  }
}

export type TreeKeyboardAction =
  | { type: 'move'; index: number }
  | { type: 'expand'; id: string }
  | { type: 'collapse'; id: string }
  | { type: 'none' }

/**
 * 方向键语义（与 WAI-ARIA tree 模式一致）：
 * → 未展开则展开，已展开则移入第一个子项；← 已展开则折叠，否则移到父节点。
 */
export function resolveKeyboardTarget(
  rows: HoloTreeRow[],
  currentIndex: number,
  key: string,
  expandedIds: Iterable<string>,
): TreeKeyboardAction {
  if (rows.length === 0) return { type: 'none' }
  const expanded = expandedIds instanceof Set ? expandedIds : new Set(expandedIds)
  const index = currentIndex < 0 || currentIndex >= rows.length ? 0 : currentIndex
  const row = rows[index]
  const isExpandableBranch = row.node.kind === 'branch'

  switch (key) {
    case 'ArrowDown':
      return { type: 'move', index: Math.min(rows.length - 1, index + 1) }
    case 'ArrowUp':
      return { type: 'move', index: Math.max(0, index - 1) }
    case 'Home':
      return { type: 'move', index: 0 }
    case 'End':
      return { type: 'move', index: rows.length - 1 }
    case 'ArrowRight': {
      if (!isExpandableBranch) return { type: 'none' }
      if (!expanded.has(row.node.id)) return { type: 'expand', id: row.node.id }
      const next = rows[index + 1]
      return next && next.depth > row.depth ? { type: 'move', index: index + 1 } : { type: 'none' }
    }
    case 'ArrowLeft': {
      if (isExpandableBranch && expanded.has(row.node.id)) return { type: 'collapse', id: row.node.id }
      for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
        if (rows[cursor].depth < row.depth) return { type: 'move', index: cursor }
      }
      return { type: 'none' }
    }
    default:
      return { type: 'none' }
  }
}

/** 首字母跳转：从 fromIndex 之后循环查找 label 前缀匹配的行。 */
export function findTypeaheadIndex(rows: HoloTreeRow[], prefix: string, fromIndex: number): number {
  if (rows.length === 0 || prefix === '') return -1
  const needle = prefix.toLowerCase()
  for (let offset = 1; offset <= rows.length; offset += 1) {
    const index = (fromIndex + offset) % rows.length
    if (rows[index].node.label.toLowerCase().startsWith(needle)) return index
  }
  return -1
}

/** Shift 连选：可见行区间内的 id 集合。 */
export function resolveRangeSelection(rows: HoloTreeRow[], anchorId: string | undefined, targetId: string): string[] {
  const targetIndex = rows.findIndex(row => row.node.id === targetId)
  if (targetIndex < 0) return []
  const anchorIndex = anchorId ? rows.findIndex(row => row.node.id === anchorId) : -1
  if (anchorIndex < 0) return [targetId]
  const [from, to] = anchorIndex <= targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex]
  return rows.slice(from, to + 1).map(row => row.node.id)
}

/** 节点是否应渲染开合器。 */
export function isExpandable(row: HoloTreeRow, hasLoader: boolean): boolean {
  if (row.node.kind !== 'branch') return false
  if (row.node.expandable !== undefined) return row.node.expandable
  return row.hasChildren || hasLoader
}
