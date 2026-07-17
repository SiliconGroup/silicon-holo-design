import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HoloDatePicker } from './DatePicker'

describe('HoloDatePicker', () => {
  it('opens from the keyboard and restores trigger focus on Escape', () => {
    render(<HoloDatePicker placeholder="Choose date" onChange={() => undefined} />)

    const trigger = screen.getByRole('button', { name: 'Choose date' })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(screen.getByRole('dialog', { name: 'Choose date' })).toBeDefined()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('does not open when disabled', () => {
    render(<HoloDatePicker placeholder="Choose date" disabled onChange={() => undefined} />)
    const trigger = screen.getByRole('button', { name: 'Choose date' })
    expect(trigger.hasAttribute('disabled')).toBe(true)
    fireEvent.click(trigger)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('preserves calendar dates without UTC conversion', () => {
    const onChange = vi.fn()
    render(<HoloDatePicker value="2026-07-15" onChange={onChange} />)
    const trigger = screen.getByRole('button')
    expect(trigger.textContent).toBe(new Date(2026, 6, 15).toLocaleDateString())
    fireEvent.click(trigger)
    const selectedDate = screen.getByRole('gridcell', { name: new Date(2026, 6, 15).toLocaleDateString('en-US') })
    expect(selectedDate.className).toContain('bg-surface-selected')
    fireEvent.click(selectedDate)
    expect(onChange).toHaveBeenCalledWith('2026-07-15')
  })

  it('does not normalize impossible calendar dates', () => {
    render(<HoloDatePicker value="2026-02-31" onChange={() => undefined} />)
    expect(screen.getByRole('button').textContent).toContain('2026-02-31')
  })

  it('uses locale-aware labels and arrow-key grid navigation', () => {
    render(<HoloDatePicker value="2026-07-15" onChange={() => undefined} />)
    fireEvent.click(screen.getByRole('button'))
    const selected = screen.getByRole('gridcell', { name: new Date(2026, 6, 15).toLocaleDateString('en-US') })
    selected.focus()
    fireEvent.keyDown(selected, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(screen.getByRole('gridcell', { name: new Date(2026, 6, 16).toLocaleDateString('en-US') }))
  })

  it('supports month paging from the keyboard', () => {
    render(<HoloDatePicker value="2026-07-15" onChange={() => undefined} />)
    fireEvent.click(screen.getByRole('button'))
    const selected = screen.getByRole('gridcell', { name: new Date(2026, 6, 15).toLocaleDateString('en-US') })
    selected.focus()
    fireEvent.keyDown(selected, { key: 'PageDown' })
    expect(screen.getByRole('grid', { name: /August 2026/ })).toBeDefined()
  })

  it('clamps month paging at the target month end', async () => {
    render(<HoloDatePicker value="2026-01-31" onChange={() => undefined} />)
    fireEvent.click(screen.getByRole('button'))
    const selected = screen.getByRole('gridcell', { name: new Date(2026, 0, 31).toLocaleDateString('en-US') })
    selected.focus()
    fireEvent.keyDown(selected, { key: 'PageDown' })
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('gridcell', { name: new Date(2026, 1, 28).toLocaleDateString('en-US') })))
  })
})
