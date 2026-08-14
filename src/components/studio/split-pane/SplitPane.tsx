import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent } from 'react'
import type { HoloSplitPaneProps } from '../types'
import { useStudioLocale } from '../utils/use-studio-locale'

const KEYBOARD_STEP = 8
const KEYBOARD_STEP_FAST = 32

/**
 * 收敛到整像素。
 * 指针拖拽得到的是小数坐标，直接用作栏宽会让分隔条与相邻边框落在半像素上，
 * 视觉上表现为错位/双线，宿主界面里也会出现 120.8828125px 这类尺寸。
 */
function clamp(value: number, min: number, max: number) {
  return Math.round(Math.min(Math.max(value, min), Math.max(min, max)))
}

export function HoloSplitPane({
  direction = 'horizontal',
  size: controlledSize,
  onSizeChange,
  defaultSize = 260,
  minSize = 120,
  maxSize = 720,
  resetOnDoubleClick = true,
  children,
  ariaLabel,
  className = '',
}: HoloSplitPaneProps) {
  const locale = useStudioLocale()
  const containerRef = useRef<HTMLDivElement>(null)
  const [internalSize, setInternalSize] = useState(defaultSize)
  const [containerSize, setContainerSize] = useState(0)
  const [dragging, setDragging] = useState(false)
  const horizontal = direction === 'horizontal'
  const rawSize = controlledSize ?? internalSize

  // 容器实际尺寸参与 clamp，避免窗口变窄后第一栏挤掉第二栏。
  const upperBound = containerSize > 0 ? Math.min(maxSize, Math.max(minSize, containerSize - minSize)) : maxSize
  const size = clamp(rawSize, minSize, upperBound)

  const commit = useCallback((next: number) => {
    const clamped = clamp(next, minSize, upperBound)
    if (controlledSize === undefined) setInternalSize(clamped)
    if (clamped !== size) onSizeChange?.(clamped)
  }, [controlledSize, minSize, onSizeChange, size, upperBound])

  useEffect(() => {
    const element = containerRef.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(entries => {
      const box = entries[0]?.contentRect
      if (box) setContainerSize(horizontal ? box.width : box.height)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [horizontal])

  /*
   * 容器尺寸只参与**渲染期** clamp（见上方 `size` 的计算），不会写回状态、也不通知宿主。
   *
   * 存下来的尺寸代表用户意图，clamp 是呈现层的事：容器变窄时视觉上收窄，容器恢复后回到
   * 用户原本拖到的尺寸——这与 VS Code、react-resizable-panels 的行为一致。
   * 反面做法是把 clamp 结果持久化：一旦某次布局过程中量到瞬时的偏小高度（字体换页、
   * 祖先容器尚未定高等），用户的尺寸就会被永久改写成一个奇怪的小数值，且容器恢复后无法复原。
   */

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const container = containerRef.current
    if (!container) return
    const bounds = container.getBoundingClientRect()
    const origin = horizontal ? bounds.left : bounds.top
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)

    const move = (pointer: PointerEvent) => {
      commit((horizontal ? pointer.clientX : pointer.clientY) - origin)
    }
    const stop = () => {
      setDragging(false)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
  }

  useEffect(() => {
    if (!dragging) return
    const body = document.body
    const previousCursor = body.style.cursor
    const previousSelect = body.style.userSelect
    body.style.cursor = horizontal ? 'col-resize' : 'row-resize'
    body.style.userSelect = 'none'
    return () => {
      body.style.cursor = previousCursor
      body.style.userSelect = previousSelect
    }
  }, [dragging, horizontal])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const decrease = horizontal ? 'ArrowLeft' : 'ArrowUp'
    const increase = horizontal ? 'ArrowRight' : 'ArrowDown'
    const step = event.shiftKey ? KEYBOARD_STEP_FAST : KEYBOARD_STEP
    if (event.key === decrease) commit(size - step)
    else if (event.key === increase) commit(size + step)
    else if (event.key === 'Home') commit(minSize)
    else if (event.key === 'End') commit(upperBound)
    else if (event.key === 'Enter') commit(defaultSize)
    else return
    event.preventDefault()
  }

  const [first, second] = children
  const handleLabel = ariaLabel ?? locale.resizeHandle

  return (
    <div
      ref={containerRef}
      className={`flex min-h-0 min-w-0 ${horizontal ? 'flex-row' : 'flex-col'} ${className}`}
    >
      <div className="flex min-h-0 min-w-0" style={horizontal ? { width: size, flex: '0 0 auto' } : { height: size, flex: '0 0 auto' }}>
        {first}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-valuenow={Math.round(size)}
        aria-valuemin={minSize}
        aria-valuemax={Math.round(upperBound)}
        aria-label={handleLabel}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        onDoubleClick={resetOnDoubleClick ? () => commit(defaultSize) : undefined}
        className={`shd-control-focus group relative flex-none bg-transparent ${horizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'}`}
      >
        <span
          aria-hidden="true"
          className={`absolute bg-stroke-muted transition-colors duration-150 group-hover:bg-stroke-accent ${horizontal ? 'inset-y-0 left-0 w-px' : 'inset-x-0 top-0 h-px'} ${dragging ? 'bg-stroke-accent' : ''}`}
        />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1">{second}</div>
    </div>
  )
}
