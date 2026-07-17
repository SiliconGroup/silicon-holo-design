import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloPopover } from './Popover'

describe('HoloPopover', () => {
  it('opens and closes on outside click', () => {
    render(<><HoloPopover content="Details"><button>Open</button></HoloPopover><button>Outside</button></>)
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    const trigger = screen.getByRole('button', { name: 'Open' })
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('text-content-primary')
    expect(screen.getByRole('dialog', { name: 'Open' })).toBe(dialog)
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-controls')).toBe(dialog.id)
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes on Escape and restores trigger focus', () => {
    render(<HoloPopover content="Details"><button>Open details</button></HoloPopover>)
    const trigger = screen.getByRole('button', { name: 'Open details' })
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('supports focus interaction in hover mode', () => {
    render(<><HoloPopover trigger="hover" content="Details"><button>Inspect</button></HoloPopover><button>Outside</button></>)
    const trigger = screen.getByRole('button', { name: 'Inspect' })
    fireEvent.focus(trigger)
    expect(screen.getByRole('dialog')).toBeDefined()

    fireEvent.blur(trigger, { relatedTarget: screen.getByRole('button', { name: 'Outside' }) })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('positions the portal panel against the viewport', () => {
    render(<HoloPopover content="Details"><button type="button">Open</button></HoloPopover>)
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('dialog').style.position).toBe('fixed')
  })
})
