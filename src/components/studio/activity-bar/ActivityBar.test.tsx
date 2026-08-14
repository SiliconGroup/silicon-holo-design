import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { HoloActivityBar } from './ActivityBar'
import type { HoloActivityBarItem } from '../types'

const items: HoloActivityBarItem[] = [
  { id: 'explorer', icon: <span>E</span>, title: 'Explorer' },
  { id: 'git', icon: <span>G</span>, title: 'Source Control', badge: 3 },
  { id: 'off', icon: <span>X</span>, title: 'Disabled', disabled: true },
  { id: 'settings', icon: <span>S</span>, title: 'Settings', placement: 'bottom' },
]

describe('HoloActivityBar', () => {
  it('renders a vertical tablist with one tab per item', () => {
    render(<HoloActivityBar items={items} activeId="explorer" />)
    const list = screen.getByRole('tablist')
    expect(list.getAttribute('aria-orientation')).toBe('vertical')
    expect(list.getAttribute('aria-label')).toBe('Studio panels')
    expect(screen.getAllByRole('tab')).toHaveLength(4)
  })

  it('marks only the active item as selected and tabbable', () => {
    render(<HoloActivityBar items={items} activeId="git" />)
    const git = screen.getByRole('tab', { name: 'Source Control (3)' })
    const explorer = screen.getByRole('tab', { name: 'Explorer' })
    expect(git.getAttribute('aria-selected')).toBe('true')
    expect(git.getAttribute('tabindex')).toBe('0')
    expect(explorer.getAttribute('aria-selected')).toBe('false')
    expect(explorer.getAttribute('tabindex')).toBe('-1')
  })

  it('reports activation and re-selection separately', () => {
    const onActiveChange = vi.fn()
    const onActiveReselect = vi.fn()
    render(<HoloActivityBar items={items} activeId="explorer" onActiveChange={onActiveChange} onActiveReselect={onActiveReselect} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Source Control (3)' }))
    expect(onActiveChange).toHaveBeenCalledWith('git')
    expect(onActiveReselect).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('tab', { name: 'Explorer' }))
    expect(onActiveReselect).toHaveBeenCalledWith('explorer')
  })

  it('never activates a disabled item', () => {
    const onActiveChange = vi.fn()
    render(<HoloActivityBar items={items} activeId="explorer" onActiveChange={onActiveChange} />)
    const disabled = screen.getByRole('tab', { name: 'Disabled' })
    expect(disabled.hasAttribute('disabled')).toBe(true)
    fireEvent.click(disabled)
    expect(onActiveChange).not.toHaveBeenCalled()
  })

  it('moves focus with the vertical arrows, skipping disabled items', () => {
    render(<HoloActivityBar items={items} activeId="explorer" />)
    const explorer = screen.getByRole('tab', { name: 'Explorer' })
    act(() => explorer.focus())
    fireEvent.keyDown(explorer, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Source Control (3)' }))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Settings' }))
  })

  it('wraps around and supports Home and End', () => {
    render(<HoloActivityBar items={items} activeId="explorer" />)
    const explorer = screen.getByRole('tab', { name: 'Explorer' })
    act(() => explorer.focus())
    fireEvent.keyDown(explorer, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Settings' }))
    fireEvent.keyDown(document.activeElement!, { key: 'Home' })
    expect(document.activeElement).toBe(explorer)
    fireEvent.keyDown(explorer, { key: 'End' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Settings' }))
  })

  it('exposes the badge in the accessible name and as visible text', () => {
    render(<HoloActivityBar items={items} activeId="explorer" />)
    expect(screen.getByRole('tab', { name: 'Source Control (3)' })).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })

  it('links each tab to the panel container', () => {
    render(<HoloActivityBar items={items} activeId="explorer" panelContainerId="studio-panel" />)
    expect(screen.getByRole('tab', { name: 'Explorer' }).getAttribute('aria-controls')).toBe('studio-panel')
  })

  it('falls back to the first enabled item as tab stop without an active id', () => {
    render(<HoloActivityBar items={items} />)
    expect(screen.getByRole('tab', { name: 'Explorer' }).getAttribute('tabindex')).toBe('0')
  })

  it('clears native button chrome on every tab', () => {
    render(<HoloActivityBar items={items} activeId="explorer" />)
    for (const tab of screen.getAllByRole('tab')) {
      expect(tab.className).toContain('border-none')
      expect(tab.className).toContain('bg-transparent')
      expect(tab.className).toContain('shd-control-focus')
    }
  })
})
