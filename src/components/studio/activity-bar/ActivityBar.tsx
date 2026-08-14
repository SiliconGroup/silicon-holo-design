import { useRef, type KeyboardEvent } from 'react'
import { HoloTooltip } from '@/components/data-display/tooltip'
import type { HoloActivityBarItem, HoloActivityBarProps } from '../types'
import { useStudioLocale } from '../utils/use-studio-locale'

/**
 * 图标角标。
 *
 * 视觉取向与 VS Code 活动栏一致：贴在图标右下角的实心小胶囊，而不是带描边的大气泡。
 * 在 40px 窄栏里，带边框的 16px 气泡会与居中的 16px 图标抢空间、读起来像第二个控件；
 * 这里用 14px 实心填充 + 9px 字号，使其读作「数据信号」。
 * 角标纯装饰：数量已经进入按钮的 aria-label，因此 aria-hidden。
 */
function ActivityBadge({ value }: { value: string | number }) {
  const text = typeof value === 'number' && value > 99 ? '99+' : String(value)
  return (
    <span
      aria-hidden="true"
      className="absolute bottom-0 right-0 z-10 box-border flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent-primary px-0.5 text-[9px] font-medium leading-none text-content-on-accent"
    >
      {text}
    </span>
  )
}

export function HoloActivityBar({
  items,
  activeId,
  onActiveChange,
  onActiveReselect,
  panelContainerId,
  ariaLabel,
  className = '',
}: HoloActivityBarProps) {
  const locale = useStudioLocale()
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())
  const top = items.filter(item => (item.placement ?? 'top') === 'top')
  const bottom = items.filter(item => item.placement === 'bottom')
  const enabled = [...top, ...bottom].filter(item => !item.disabled)
  const fallbackId = enabled[0]?.id

  const activate = (item: HoloActivityBarItem) => {
    if (item.disabled) return
    if (item.id === activeId) onActiveReselect?.(item.id)
    else onActiveChange?.(item.id)
  }

  const focusAt = (index: number) => {
    if (enabled.length === 0) return
    const target = enabled[(index + enabled.length) % enabled.length]
    buttonRefs.current.get(target.id)?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, item: HoloActivityBarItem) => {
    const index = enabled.findIndex(candidate => candidate.id === item.id)
    if (event.key === 'ArrowDown') focusAt(index + 1)
    else if (event.key === 'ArrowUp') focusAt(index - 1)
    else if (event.key === 'Home') focusAt(0)
    else if (event.key === 'End') focusAt(enabled.length - 1)
    else return
    event.preventDefault()
  }

  const renderItem = (item: HoloActivityBarItem) => {
    const isActive = item.id === activeId
    const tabbable = !item.disabled && (isActive || (activeId === undefined && item.id === fallbackId))
    const label = item.badge === undefined ? item.title : `${item.title} (${item.badge})`
    return (
      <HoloTooltip key={item.id} content={item.title} placement="right">
        <button
          type="button"
          role="tab"
          ref={node => {
            if (node) buttonRefs.current.set(item.id, node)
            else buttonRefs.current.delete(item.id)
          }}
          data-shd-activity-item={item.id}
          aria-selected={isActive}
          aria-label={label}
          aria-controls={panelContainerId}
          disabled={item.disabled}
          tabIndex={tabbable ? 0 : -1}
          onClick={() => activate(item)}
          onKeyDown={event => handleKeyDown(event, item)}
          className={`
            border-none shd-control-focus bg-transparent relative flex h-10 w-10 items-center justify-center rounded-sm
            transition-colors duration-150 hover:bg-surface-interactive disabled:cursor-not-allowed disabled:text-content-disabled
            ${isActive ? 'text-content-accent' : 'text-content-tertiary hover:text-content-primary'}
          `}
        >
          {/* 激活填充用绝对定位层实现，避免与基础 bg-transparent 产生工具类优先级竞争 */}
          {isActive && <>
            <span aria-hidden="true" className="absolute inset-0 rounded-sm bg-surface-selected" />
            <span aria-hidden="true" className="absolute inset-y-1 left-0 w-0.5 bg-accent-primary" />
          </>}
          <span className="relative flex items-center justify-center">{item.icon}</span>
          {item.badge !== undefined && <ActivityBadge value={item.badge} />}
        </button>
      </HoloTooltip>
    )
  }

  return (
    <div
      role="tablist"
      aria-orientation="vertical"
      aria-label={ariaLabel ?? locale.activityBarLabel}
      className={`flex w-12 flex-none flex-col items-center gap-0.5 border-r border-stroke-muted bg-surface-base py-2 ${className}`}
    >
      {top.map(renderItem)}
      {bottom.length > 0 && <div className="mt-auto flex flex-col items-center gap-0.5">{bottom.map(renderItem)}</div>}
    </div>
  )
}
