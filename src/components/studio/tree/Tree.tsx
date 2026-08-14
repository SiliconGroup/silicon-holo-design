import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { HoloEmpty } from '@/components/data-display/empty'
import { HoloSpinner } from '@/components/feedback/spinner'
import type { HoloTreeNode, HoloTreeNodeStatus, HoloTreeProps } from '../types'
import { resolveFileIcon } from '../utils/file-icon'
import { useStudioLocale } from '../utils/use-studio-locale'
import { buildVisibleRows, computeWindow, findTypeaheadIndex, isExpandable, resolveKeyboardTarget, resolveRangeSelection, type HoloTreeRow } from './tree-model'

const TYPEAHEAD_WINDOW_MS = 1000
const OVERSCAN = 8

const statusClass: Record<HoloTreeNodeStatus, string> = {
  default: 'text-content-secondary',
  added: 'text-status-success',
  modified: 'text-accent-primary',
  deleted: 'text-content-tertiary line-through',
  renamed: 'text-accent-blue',
  untracked: 'text-status-success',
  ignored: 'text-content-disabled',
  conflicted: 'text-status-error',
  error: 'text-status-error',
}

function Switcher({ expanded, loading, onToggle }: { expanded: boolean; loading?: boolean; onToggle(): void }) {
  if (loading) {
    return (
      <span className="flex h-4 w-4 flex-none items-center justify-center" aria-hidden="true">
        <HoloSpinner size="sm" />
      </span>
    )
  }
  return (
    <span
      role="presentation"
      onClick={event => { event.stopPropagation(); onToggle() }}
      className="flex h-4 w-4 flex-none cursor-pointer items-center justify-center text-content-tertiary"
    >
      <svg
        className={`h-3 w-3 transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
        viewBox="0 0 12 12"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4 2.5 8 6l-4 3.5z" />
      </svg>
    </span>
  )
}

export function HoloTree({
  nodes,
  expandedIds,
  onExpandedChange,
  selectedIds,
  onSelectedChange,
  multiple = false,
  onFocusNode,
  onActivate,
  onActivatePinned,
  activateOn = 'doubleClick',
  onContextMenu,
  loadChildren,
  loadedIds,
  onLoadedIdsChange,
  onChildrenLoaded,
  onLoadError,
  onRename,
  rowHeight = 24,
  indent = 12,
  emptyContent,
  ariaLabel,
  className = '',
}: HoloTreeProps) {
  const locale = useStudioLocale()
  const baseId = useId()
  const scrollRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(true)
  const inFlightRef = useRef(new Set<string>())
  const typeaheadRef = useRef({ prefix: '', at: 0 })
  const anchorRef = useRef<string | undefined>(undefined)

  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  // 焦点框只在键盘交互时显示，与 :focus-visible 的语义一致。
  // 由于焦点落在容器上、可见焦点标记在活动后代行上，无法直接用 :focus-visible 选择器，
  // 这里沿用 focus-visible 的标准启发式：指针按下后的聚焦不算键盘聚焦。
  const pointerFocusRef = useRef(false)
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const [focusedId, setFocusedId] = useState<string | undefined>(undefined)
  const [pendingIds, setPendingIds] = useState<string[]>([])
  const [renamingId, setRenamingId] = useState<string | undefined>(undefined)
  const [renameDraft, setRenameDraft] = useState('')

  const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds])
  const selectedSet = useMemo(() => new Set(selectedIds ?? []), [selectedIds])
  const pendingSet = useMemo(() => new Set(pendingIds), [pendingIds])
  const rows = useMemo(() => buildVisibleRows(nodes, expandedSet), [nodes, expandedSet])
  const view = useMemo(() => computeWindow(scrollTop, viewportHeight, rowHeight, rows.length, OVERSCAN), [scrollTop, viewportHeight, rowHeight, rows.length])

  useEffect(() => () => { mountedRef.current = false }, [])

  useEffect(() => {
    const element = scrollRef.current
    if (!element || typeof ResizeObserver === 'undefined') return
    setViewportHeight(element.clientHeight)
    const observer = new ResizeObserver(entries => {
      const box = entries[0]?.contentRect
      if (box) setViewportHeight(box.height)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const focusedIndex = focusedId ? rows.findIndex(row => row.node.id === focusedId) : -1
  const activeIndex = focusedIndex >= 0 ? focusedIndex : 0

  const requestChildren = useCallback((node: HoloTreeNode) => {
    if (!loadChildren) return
    if (loadedIds?.includes(node.id)) return
    if (inFlightRef.current.has(node.id)) return
    inFlightRef.current.add(node.id)
    setPendingIds(previous => (previous.includes(node.id) ? previous : [...previous, node.id]))
    loadChildren(node).then(
      children => {
        inFlightRef.current.delete(node.id)
        if (!mountedRef.current) return
        setPendingIds(previous => previous.filter(id => id !== node.id))
        onChildrenLoaded?.(node, children)
        if (!loadedIds?.includes(node.id)) onLoadedIdsChange?.([...(loadedIds ?? []), node.id])
      },
      error => {
        inFlightRef.current.delete(node.id)
        if (!mountedRef.current) return
        setPendingIds(previous => previous.filter(id => id !== node.id))
        onLoadError?.(node, error)
      },
    )
  }, [loadChildren, loadedIds, onChildrenLoaded, onLoadError, onLoadedIdsChange])

  const setExpanded = useCallback((node: HoloTreeNode, next: boolean) => {
    if (next) {
      if (!expandedSet.has(node.id)) onExpandedChange([...expandedIds, node.id])
      requestChildren(node)
    } else if (expandedSet.has(node.id)) {
      onExpandedChange(expandedIds.filter(id => id !== node.id))
    }
  }, [expandedIds, expandedSet, onExpandedChange, requestChildren])

  const focusRow = useCallback((node: HoloTreeNode) => {
    setFocusedId(node.id)
    onFocusNode?.(node)
  }, [onFocusNode])

  const select = useCallback((node: HoloTreeNode, event?: { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean }) => {
    if (!onSelectedChange) return
    const current = selectedIds ?? []
    if (multiple && event?.shiftKey) {
      onSelectedChange(resolveRangeSelection(rows, anchorRef.current, node.id))
      return
    }
    if (multiple && (event?.metaKey || event?.ctrlKey)) {
      anchorRef.current = node.id
      onSelectedChange(current.includes(node.id) ? current.filter(id => id !== node.id) : [...current, node.id])
      return
    }
    anchorRef.current = node.id
    onSelectedChange([node.id])
  }, [multiple, onSelectedChange, rows, selectedIds])

  const handleRowClick = (row: HoloTreeRow, event: MouseEvent<HTMLDivElement>) => {
    if (row.node.disabled) return
    setKeyboardFocus(false)
    focusRow(row.node)
    select(row.node, event)
    // 单击 branch 始终切换展开，与 activateOn 无关。
    if (isExpandable(row, Boolean(loadChildren))) setExpanded(row.node, !expandedSet.has(row.node.id))
    if (activateOn === 'click') onActivate?.(row.node)
  }

  const handleRowDoubleClick = (row: HoloTreeRow) => {
    if (row.node.disabled) return
    // click 模式下双击是「打开并保持」；默认的 doubleClick 模式下双击就是普通打开。
    if (activateOn === 'click') onActivatePinned?.(row.node)
    else onActivate?.(row.node)
  }

  const commitRename = (node: HoloTreeNode) => {
    const next = renameDraft.trim()
    setRenamingId(undefined)
    if (next.length > 0 && next !== node.label) onRename?.(node, next)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (renamingId !== undefined) return
    if (rows.length === 0) return
    setKeyboardFocus(true)
    const row = rows[activeIndex]

    if (event.key === 'Enter') {
      event.preventDefault()
      if (!row.node.disabled) onActivate?.(row.node)
      return
    }
    if (event.key === ' ') {
      event.preventDefault()
      if (!row.node.disabled) select(row.node, { metaKey: true, ctrlKey: true, shiftKey: false })
      return
    }
    if (event.key === 'F2' && onRename) {
      event.preventDefault()
      setRenameDraft(row.node.label)
      setRenamingId(row.node.id)
      return
    }

    const action = resolveKeyboardTarget(rows, activeIndex, event.key, expandedSet)
    if (action.type === 'move') {
      event.preventDefault()
      focusRow(rows[action.index].node)
      return
    }
    if (action.type === 'expand') {
      event.preventDefault()
      setExpanded(row.node, true)
      return
    }
    if (action.type === 'collapse') {
      event.preventDefault()
      setExpanded(row.node, false)
      return
    }

    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey && event.key !== ' ') {
      const now = Date.now()
      const prefix = now - typeaheadRef.current.at < TYPEAHEAD_WINDOW_MS ? typeaheadRef.current.prefix + event.key : event.key
      typeaheadRef.current = { prefix, at: now }
      const index = findTypeaheadIndex(rows, prefix, prefix.length > 1 ? activeIndex - 1 : activeIndex)
      if (index >= 0) {
        event.preventDefault()
        focusRow(rows[index].node)
      }
    }
  }

  // 焦点行滚入可视区。用 scrollTop 直接赋值而不是 scrollIntoView，避免影响祖先滚动容器。
  useLayoutEffect(() => {
    const element = scrollRef.current
    if (!element || focusedIndex < 0) return
    const top = focusedIndex * rowHeight
    const bottom = top + rowHeight
    if (top < element.scrollTop) element.scrollTop = top
    else if (bottom > element.scrollTop + element.clientHeight) element.scrollTop = bottom - element.clientHeight
  }, [focusedIndex, rowHeight])

  if (rows.length === 0) {
    return (
      <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
        {emptyContent ?? <HoloEmpty description={locale.treeEmpty} />}
      </div>
    )
  }

  const visible = rows.slice(view.start, view.end)
  const rowDomId = (id: string) => `${baseId}-${id}`

  return (
    <div
      ref={scrollRef}
      role="tree"
      aria-label={ariaLabel ?? locale.treeLabel}
      aria-multiselectable={multiple}
      aria-activedescendant={focusedId ? rowDomId(focusedId) : undefined}
      tabIndex={0}
      onScroll={event => setScrollTop(event.currentTarget.scrollTop)}
      onKeyDown={handleKeyDown}
      onPointerDown={() => { pointerFocusRef.current = true; setKeyboardFocus(false) }}
      onFocus={() => { setKeyboardFocus(!pointerFocusRef.current); pointerFocusRef.current = false }}
      onBlur={event => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
        // 同时清掉指针标记：容器已有焦点时 pointerdown 不会再触发 focus，
        // 若不清零，下一次用键盘回到树里会被误判成指针聚焦而不显示焦点框。
        pointerFocusRef.current = false
        setKeyboardFocus(false)
      }}
      className={`shd-scrollbar shd-control-focus min-h-0 flex-1 overflow-auto text-xs ${className}`}
    >
      <div role="presentation" style={{ paddingTop: view.paddingTop, paddingBottom: view.paddingBottom }}>
        {visible.map(row => {
          const { node } = row
          const expandable = isExpandable(row, Boolean(loadChildren))
          const expanded = expandedSet.has(node.id)
          const selected = selectedSet.has(node.id)
          const focused = node.id === focusedId
          const loading = node.loading || pendingSet.has(node.id)
          const status: HoloTreeNodeStatus = node.error ? 'error' : node.status ?? 'default'
          const icon = node.icon ?? resolveFileIcon({ fileName: node.label, isDirectory: node.kind === 'branch', expanded })

          return (
            <div
              key={node.id}
              id={rowDomId(node.id)}
              role="treeitem"
              aria-level={row.depth + 1}
              aria-selected={selected}
              aria-expanded={expandable ? expanded : undefined}
              aria-busy={loading ? true : undefined}
              aria-disabled={node.disabled ? true : undefined}
              data-shd-tree-row={node.id}
              title={node.error ?? node.label}
              onClick={event => handleRowClick(row, event)}
              onDoubleClick={() => handleRowDoubleClick(row)}
              onContextMenu={event => onContextMenu?.(node, event)}
              className={`
                relative flex select-none items-center gap-1 pr-2 transition-colors duration-150
                ${node.disabled ? 'cursor-not-allowed text-content-disabled' : 'cursor-pointer'}
                ${selected ? 'bg-surface-selected' : 'hover:bg-surface-interactive'}
                ${keyboardFocus && focused ? 'shd-focus-frame' : ''}
              `}
              style={{ height: rowHeight, paddingLeft: 4 + row.depth * indent }}
            >
              {selected && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-accent-primary" />}
              {expandable
                ? <Switcher expanded={expanded} loading={loading} onToggle={() => setExpanded(node, !expanded)} />
                : <span className="h-4 w-4 flex-none" aria-hidden="true" />}
              <span className="flex-none text-content-tertiary">{icon}</span>
              {renamingId === node.id
                ? <input
                    autoFocus
                    value={renameDraft}
                    aria-label={locale.rename}
                    onChange={event => setRenameDraft(event.target.value)}
                    onBlur={() => commitRename(node)}
                    onClick={event => event.stopPropagation()}
                    onKeyDown={event => {
                      event.stopPropagation()
                      if (event.key === 'Enter') commitRename(node)
                      else if (event.key === 'Escape') setRenamingId(undefined)
                    }}
                    className="shd-control-focus min-w-0 flex-1 rounded-sm border border-stroke-accent bg-surface-inset px-1 text-xs text-content-primary"
                  />
                : <span className={`min-w-0 flex-1 truncate ${selected && status === 'default' ? 'text-content-primary' : statusClass[status]}`}>{node.label}</span>}
              {node.error !== undefined && <span role="alert" className="flex-none text-[10px] text-status-error">{locale.treeLoadFailed}</span>}
              {node.badge !== undefined && <span className="flex-none font-mono text-[10px] text-content-tertiary">{node.badge}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
