import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from 'react'
import { formatMessage } from '@/locale'
import type { HoloFileTab, HoloFileTabsProps } from '../types'
import { useStudioLocale } from '../utils/use-studio-locale'

export function HoloFileTabs({
  tabs,
  activeId,
  onActiveChange,
  onClose,
  closable = true,
  closeOnMiddleClick = true,
  onContextMenu,
  onPin,
  ariaLabel,
  className = '',
}: HoloFileTabsProps) {
  const locale = useStudioLocale()
  const tabRefs = useRef(new Map<string, HTMLButtonElement>())
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeId) return
    const strip = stripRef.current
    const node = tabRefs.current.get(activeId)
    if (!strip || !node) return
    /*
     * 只滚动标签条自身，绝不用 scrollIntoView。
     * scrollIntoView 会连带滚动**所有**可滚动祖先（包括文档本身），
     * 于是页面里任何一处 HoloFileTabs 挂载时都会把整页拽到它自己身上。
     */
    const left = node.offsetLeft
    const right = left + node.offsetWidth
    if (left < strip.scrollLeft) strip.scrollLeft = left
    else if (right > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = right - strip.clientWidth
  }, [activeId])

  const focusAt = (index: number) => {
    if (tabs.length === 0) return
    const target = tabs[(index + tabs.length) % tabs.length]
    tabRefs.current.get(target.id)?.focus()
    onActiveChange?.(target.id)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tab: HoloFileTab) => {
    const index = tabs.findIndex(candidate => candidate.id === tab.id)
    if (event.key === 'ArrowRight') focusAt(index + 1)
    else if (event.key === 'ArrowLeft') focusAt(index - 1)
    else if (event.key === 'Home') focusAt(0)
    else if (event.key === 'End') focusAt(tabs.length - 1)
    else if (event.key === 'w' && (event.metaKey || event.ctrlKey) && closable) onClose?.(tab.id)
    else return
    event.preventDefault()
  }

  const handleAuxClick = (event: MouseEvent<HTMLButtonElement>, tab: HoloFileTab) => {
    if (!closeOnMiddleClick || !closable || event.button !== 1) return
    event.preventDefault()
    onClose?.(tab.id)
  }

  return (
    <div
      ref={stripRef}
      role="tablist"
      aria-label={ariaLabel ?? locale.tabsLabel}
      className={`shd-scrollbar flex flex-none items-stretch overflow-x-auto border-b border-stroke-muted bg-surface-base ${className}`}
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeId
        return (
          <div key={tab.id} className="group relative flex flex-none items-stretch">
            <button
              type="button"
              role="tab"
              ref={node => {
                if (node) tabRefs.current.set(tab.id, node)
                else tabRefs.current.delete(tab.id)
              }}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              data-shd-tab-preview={tab.preview === true ? 'true' : undefined}
              title={tab.title ?? tab.label}
              onClick={() => onActiveChange?.(tab.id)}
              onDoubleClick={() => { if (tab.preview === true) onPin?.(tab.id) }}
              onAuxClick={event => handleAuxClick(event, tab)}
              onKeyDown={event => handleKeyDown(event, tab)}
              onContextMenu={event => onContextMenu?.(tab, event)}
              className={`
                border-none shd-control-focus bg-transparent relative flex max-w-56 items-center gap-1.5 py-1.5 pl-3 text-xs
                transition-colors duration-150
                ${closable ? 'pr-7' : 'pr-3'}
                ${isActive ? 'text-content-primary' : 'text-content-tertiary hover:text-content-primary'}
              `}
            >
              {isActive && <>
                <span aria-hidden="true" className="absolute inset-0 bg-surface-raised" />
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-accent-primary" />
              </>}
              {tab.icon !== undefined && <span aria-hidden="true" className="relative flex-none text-content-tertiary">{tab.icon}</span>}
              {/*
                预览标签用斜体表示「会被下一次单击替换」，与 VS Code 一致。
                斜体字形的墨迹会超出它的推进宽度，而 truncate 带的 overflow:hidden 在
                内边距边界处裁切，所以必须给斜体留一点右内边距，否则最后一个字符会被切掉。
              */}
              <span className={`relative truncate ${tab.preview === true ? 'italic pr-0.5' : ''}`}>{tab.label}</span>
            </button>
            {closable && <span className="pointer-events-none absolute right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center">
              {tab.dirty === true && <span
                aria-hidden="true"
                title={locale.unsavedChanges}
                className="h-1.5 w-1.5 rounded-full bg-accent-primary group-hover:hidden"
              />}
              <button
                type="button"
                aria-label={formatMessage(locale.closeTab, { name: tab.label })}
                onClick={event => { event.stopPropagation(); onClose?.(tab.id) }}
                className={`
                  border-none shd-control-focus bg-transparent pointer-events-auto h-5 w-5 flex items-center justify-center rounded-sm
                  text-content-tertiary transition-colors duration-150 hover:bg-surface-interactive hover:text-content-primary
                  ${tab.dirty === true ? 'hidden group-hover:flex' : 'flex'}
                `}
              >
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" aria-hidden="true">
                  <path d="M3 3l6 6M9 3l-6 6" />
                </svg>
              </button>
            </span>}
          </div>
        )
      })}
    </div>
  )
}
