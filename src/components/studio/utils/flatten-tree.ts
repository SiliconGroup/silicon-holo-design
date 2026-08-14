import type { HoloNestedTreeNode, HoloTreeNode } from '../types'

/**
 * 嵌套结构 → 扁平数组。深度优先，父节点先于子节点。
 * 这是本库唯一的树结构转换工具，不提供反向转换。
 */
export function flattenTree(roots: HoloNestedTreeNode[]): HoloTreeNode[] {
  const result: HoloTreeNode[] = []
  const walk = (nodes: HoloNestedTreeNode[], parentId?: string) => {
    for (const node of nodes) {
      const { children, ...rest } = node
      result.push(parentId === undefined ? { ...rest } : { ...rest, parentId })
      if (children && children.length > 0) walk(children, node.id)
    }
  }
  walk(roots)
  return result
}
