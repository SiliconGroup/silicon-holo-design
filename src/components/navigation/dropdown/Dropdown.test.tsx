import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloDropdown } from './Dropdown'

describe('HoloDropdown', () => {
  it('supports keyboard selection', () => {
    let selected = ''
    render(<HoloDropdown items={[{ key: 'open', label: 'Open file' }]} onSelect={key => { selected = key }}><button>Actions</button></HoloDropdown>)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    const trigger = screen.getByRole('button', { name: 'Actions' })
    const menu = screen.getByRole('menu')
    expect(screen.getByRole('menu', { name: 'Actions' })).toBe(menu)
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id)
    fireEvent.keyDown(document, { key: 'ArrowDown' })
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(selected).toBe('open')
    expect(document.activeElement).toBe(trigger)
  })

  it('opens from focus in hover mode and supports keyboard selection', () => {
    let selected = ''
    render(
      <HoloDropdown
        trigger="hover"
        items={[{ key: 'inspect', label: 'Inspect item' }]}
        onSelect={key => { selected = key }}
      >
        <button>Hover actions</button>
      </HoloDropdown>,
    )

    const trigger = screen.getByRole('button', { name: 'Hover actions' })
    fireEvent.focus(trigger)
    expect(screen.getByRole('menu')).toBeDefined()
    fireEvent.keyDown(document, { key: 'ArrowDown' })
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(selected).toBe('inspect')
  })
})
