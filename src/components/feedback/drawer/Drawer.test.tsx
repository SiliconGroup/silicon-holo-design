import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloDrawer } from './Drawer'

const flushFocus = () => new Promise(resolve => setTimeout(resolve, 0))

describe('HoloDrawer', () => {
  it('renders an accessible drawer and closes with Escape', () => {
    const onClose = vi.fn()
    render(<HoloDrawer open onClose={onClose} title="Inspector"><button>Action</button></HoloDrawer>)
    expect(screen.getByRole('dialog', { name: 'Inspector' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Close' })).toBeDefined()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('focuses the drawer when no visible controls are available', async () => {
    render(
      <HoloDrawer open onClose={() => {}} ariaLabel="Passive drawer" closable={false}>
        <button disabled tabIndex={0}>Disabled</button>
        <button hidden>Hidden</button>
        <button tabIndex={-1}>Programmatic only</button>
        <div style={{ display: 'none' }}><button>CSS hidden</button></div>
        <fieldset disabled><button>Fieldset disabled</button></fieldset>
      </HoloDrawer>
    )
    const drawer = screen.getByRole('dialog', { name: 'Passive drawer' })
    await flushFocus()
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
    expect(document.activeElement).toBe(drawer)
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(drawer)
  })

  it('cycles focus and restores the opener', async () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()
    const { rerender } = render(
      <HoloDrawer open onClose={() => {}} ariaLabel="Focus drawer" closable={false}>
        <button>First</button><button>Last</button>
      </HoloDrawer>
    )
    const first = screen.getByRole('button', { name: 'First' })
    const last = screen.getByRole('button', { name: 'Last' })
    await flushFocus()
    expect(document.activeElement).toBe(first)
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(first)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
    rerender(<HoloDrawer open={false} onClose={() => {}} ariaLabel="Focus drawer" closable={false}><button>First</button></HoloDrawer>)
    expect(document.activeElement).toBe(trigger)
    trigger.remove()
  })
})
