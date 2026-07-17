import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloTab } from './Tab'

describe('HoloTab', () => {
  it('implements roving tab focus and arrow navigation', () => {
    const onChange = vi.fn()
    render(<HoloTab activeKey="code" onChange={onChange} items={[{ key: 'code', label: 'Code', panelId: 'code-panel' }, { key: 'preview', label: 'Preview', panelId: 'preview-panel' }]} />)
    const tabs = screen.getAllByRole('tab')
    expect(screen.getByRole('tablist')).toBeDefined()
    expect(tabs[0].getAttribute('aria-selected')).toBe('true')
    expect(tabs[0].getAttribute('aria-controls')).toBe('code-panel')
    expect(tabs[1].tabIndex).toBe(-1)
    expect(tabs[0].className).toContain('bg-surface-selected')
    expect(tabs[1].className).toContain('bg-transparent')
    tabs[0].focus()
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith('preview')
    expect(document.activeElement).toBe(tabs[1])
  })
})
