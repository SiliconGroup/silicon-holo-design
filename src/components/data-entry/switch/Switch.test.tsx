import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloSwitch } from './Switch'

describe('HoloSwitch', () => {
  it('anchors the thumb inside the track in both states', () => {
    const onChange = vi.fn()
    const { rerender } = render(<HoloSwitch checked={false} onChange={onChange} ariaLabel="Enable telemetry" />)
    const control = screen.getByRole('switch', { name: 'Enable telemetry' })
    const thumb = control.firstElementChild as HTMLElement

    expect(thumb.className).toContain('left-0.5')
    expect(thumb.className).toContain('top-1/2')
    expect(thumb.className).toContain('-translate-y-1/2')
    expect(thumb.className).toContain('translate-x-0')

    fireEvent.click(control)
    expect(onChange).toHaveBeenCalledWith(true)

    rerender(<HoloSwitch checked onChange={onChange} ariaLabel="Enable telemetry" />)
    expect((screen.getByRole('switch', { name: 'Enable telemetry' }).firstElementChild as HTMLElement).className).toContain('translate-x-5')
  })

  it('retains an accessible name when no visible label is supplied', () => {
    render(<HoloSwitch checked={false} onChange={() => undefined} />)
    expect(screen.getByRole('switch', { name: 'Switch' })).toBeDefined()
  })
})
