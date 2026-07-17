import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloUpload } from './Upload'

describe('HoloUpload', () => {
  it('opens the file chooser from keyboard activation', () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    render(<HoloUpload onFiles={() => {}} />)
    const trigger = screen.getByRole('button')

    expect(trigger.getAttribute('tabindex')).toBe('0')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.keyDown(trigger, { key: ' ' })
    expect(click).toHaveBeenCalledTimes(2)
    click.mockRestore()
  })

  it('removes disabled upload from keyboard navigation', () => {
    render(<HoloUpload disabled onFiles={() => {}} />)
    const trigger = screen.getByRole('button')
    expect(trigger.getAttribute('aria-disabled')).toBe('true')
    expect(trigger.getAttribute('tabindex')).toBe('-1')
  })
})
