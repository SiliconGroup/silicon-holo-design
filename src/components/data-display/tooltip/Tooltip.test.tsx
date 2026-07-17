import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloTooltip } from './Tooltip'

describe('HoloTooltip', () => {
  it('shows on focus and associates the trigger with the tooltip', () => {
    render(<HoloTooltip content="Keyboard details"><button>Inspect</button></HoloTooltip>)

    const trigger = screen.getByRole('button', { name: 'Inspect' })
    fireEvent.focus(trigger)
    const tooltip = screen.getByRole('tooltip')
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id)
    expect(tooltip.style.position).toBe('fixed')

    fireEvent.blur(trigger)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})
