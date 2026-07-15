import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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
})
