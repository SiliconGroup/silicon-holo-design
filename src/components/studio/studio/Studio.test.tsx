import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloStudio } from './Studio'
import type { HoloStudioPanel } from '../types'

function makePanels(overrides: Partial<Record<string, unknown>> = {}) {
  const explorerRender = vi.fn(() => <p>explorer body</p>)
  const gitRender = vi.fn(() => <p>git body</p>)
  const settingsRender = vi.fn(() => <p>settings body</p>)
  const panels: HoloStudioPanel[] = [
    { id: 'explorer', icon: <span>E</span>, title: 'Explorer', render: explorerRender, actions: <button type="button">refresh</button> },
    { id: 'git', icon: <span>G</span>, title: 'Source Control', render: gitRender, badge: 4 },
    { id: 'settings', icon: <span>S</span>, title: 'Settings', render: settingsRender, placement: 'bottom' },
  ]
  return { panels: panels.map(panel => ({ ...panel, ...overrides })), explorerRender, gitRender, settingsRender }
}

describe('HoloStudio', () => {
  it('activates the first top panel by default', () => {
    const { panels } = makePanels()
    render(<HoloStudio panels={panels}><p>main area</p></HoloStudio>)
    expect(screen.getByText('explorer body')).toBeDefined()
    expect(screen.getByText('main area')).toBeDefined()
    expect(screen.getByRole('tab', { name: 'Explorer' }).getAttribute('aria-selected')).toBe('true')
  })

  it('honours defaultActivePanelId', () => {
    const { panels } = makePanels()
    render(<HoloStudio panels={panels} defaultActivePanelId="git"><p>main</p></HoloStudio>)
    expect(screen.getByText('git body')).toBeDefined()
  })

  it('only renders the active panel body', () => {
    const { panels, explorerRender, gitRender, settingsRender } = makePanels()
    render(<HoloStudio panels={panels}><p>main</p></HoloStudio>)
    expect(explorerRender).toHaveBeenCalled()
    expect(gitRender).not.toHaveBeenCalled()
    expect(settingsRender).not.toHaveBeenCalled()
  })

  it('switches panels through the activity bar when uncontrolled', () => {
    const { panels } = makePanels()
    render(<HoloStudio panels={panels}><p>main</p></HoloStudio>)
    fireEvent.click(screen.getByRole('tab', { name: 'Source Control (4)' }))
    expect(screen.getByText('git body')).toBeDefined()
    expect(screen.queryByText('explorer body')).toBeNull()
  })

  it('does not change a controlled active panel by itself', () => {
    const { panels } = makePanels()
    const onActivePanelChange = vi.fn()
    render(<HoloStudio panels={panels} activePanelId="explorer" onActivePanelChange={onActivePanelChange}><p>main</p></HoloStudio>)
    fireEvent.click(screen.getByRole('tab', { name: 'Source Control (4)' }))
    expect(onActivePanelChange).toHaveBeenCalledWith('git')
    expect(screen.getByText('explorer body')).toBeDefined()
  })

  it('collapses the side panel when the active icon is clicked again, and reopens on the next click', () => {
    const { panels } = makePanels()
    render(<HoloStudio panels={panels}><p>main</p></HoloStudio>)
    fireEvent.click(screen.getByRole('tab', { name: 'Explorer' }))
    expect(screen.queryByText('explorer body')).toBeNull()
    expect(screen.queryByRole('separator')).toBeNull()
    fireEvent.click(screen.getByRole('tab', { name: 'Explorer' }))
    expect(screen.getByText('explorer body')).toBeDefined()
  })

  it('reports collapse changes for a controlled host', () => {
    const { panels } = makePanels()
    const onSideCollapsedChange = vi.fn()
    render(<HoloStudio panels={panels} sideCollapsed={false} onSideCollapsedChange={onSideCollapsedChange}><p>main</p></HoloStudio>)
    fireEvent.click(screen.getByRole('tab', { name: 'Explorer' }))
    expect(onSideCollapsedChange).toHaveBeenCalledWith(true)
    expect(screen.getByText('explorer body')).toBeDefined()
  })

  it('exposes the side panel as a tabpanel wired to the activity bar', () => {
    const { panels } = makePanels()
    render(<HoloStudio panels={panels}><p>main</p></HoloStudio>)
    const tab = screen.getByRole('tab', { name: 'Explorer' })
    const panel = screen.getByRole('tabpanel', { name: 'Explorer' })
    expect(tab.getAttribute('aria-controls')).toBe(panel.getAttribute('id'))
  })

  it('renders the panel title and its actions in the side header', () => {
    const { panels } = makePanels()
    render(<HoloStudio panels={panels}><p>main</p></HoloStudio>)
    expect(screen.getByText('Explorer')).toBeDefined()
    expect(screen.getByRole('button', { name: 'refresh' })).toBeDefined()
  })

  it('renders header, children and footer regions', () => {
    const { panels } = makePanels()
    render(<HoloStudio panels={panels} header={<p>tabs</p>} footer={<p>status</p>}><p>editor</p></HoloStudio>)
    expect(screen.getByText('tabs')).toBeDefined()
    expect(screen.getByText('editor')).toBeDefined()
    expect(screen.getByText('status')).toBeDefined()
  })

  it('shows the no-panels empty state while keeping the main area usable', () => {
    render(<HoloStudio><p>main only</p></HoloStudio>)
    expect(screen.getByText('No panels registered')).toBeDefined()
    expect(screen.getByText('main only')).toBeDefined()
  })

  it('drives the side width through the split pane and reports changes', () => {
    const { panels } = makePanels()
    const onSideWidthChange = vi.fn()
    render(<HoloStudio panels={panels} sideWidth={300} onSideWidthChange={onSideWidthChange}><p>main</p></HoloStudio>)
    const separator = screen.getByRole('separator')
    expect(separator.getAttribute('aria-valuenow')).toBe('300')
    expect(separator.getAttribute('aria-valuemin')).toBe('180')
    expect(separator.getAttribute('aria-valuemax')).toBe('520')
    fireEvent.keyDown(separator, { key: 'ArrowRight' })
    expect(onSideWidthChange).toHaveBeenCalledWith(308)
  })

  it('respects custom width bounds', () => {
    const { panels } = makePanels()
    render(<HoloStudio panels={panels} minSideWidth={120} maxSideWidth={400} defaultSideWidth={200}><p>main</p></HoloStudio>)
    const separator = screen.getByRole('separator')
    expect(separator.getAttribute('aria-valuenow')).toBe('200')
    expect(separator.getAttribute('aria-valuemin')).toBe('120')
    expect(separator.getAttribute('aria-valuemax')).toBe('400')
  })
})
