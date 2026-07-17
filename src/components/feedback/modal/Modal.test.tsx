import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloModal } from './Modal'

const flushFocus = () => new Promise(resolve => setTimeout(resolve, 0))

describe('HoloModal', () => {
  it('locks background scrolling and provides an internal scroll region', () => {
    const { rerender } = render(<HoloModal open onClose={() => {}} ariaLabel="Scrollable dialog"><div>Content</div></HoloModal>)
    expect(document.body.style.overflow).toBe('hidden')
    expect(screen.getByRole('dialog').className).toContain('max-h-[calc(100vh-32px)]')
    rerender(<HoloModal open={false} onClose={() => {}} ariaLabel="Scrollable dialog"><div>Content</div></HoloModal>)
    expect(document.body.style.overflow).toBe('')
  })
  it('renders an accessible dialog and closes with Escape', () => {
    const onClose = vi.fn()
    render(<HoloModal open onClose={onClose} title="Settings" closable><button>Action</button></HoloModal>)
    expect(screen.getByRole('dialog', { name: 'Settings' }).className).toContain('text-content-primary')
    expect(screen.getByRole('button', { name: 'Close' }).className).toContain('bg-transparent')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('focuses the dialog when content has no focusable controls', async () => {
    render(<HoloModal open onClose={() => {}} ariaLabel="Passive dialog"><p>Read only</p></HoloModal>)
    const dialog = screen.getByRole('dialog', { name: 'Passive dialog' })
    await flushFocus()
    expect(document.activeElement).toBe(dialog)
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(dialog)
  })

  it('skips hidden and disabled controls while trapping focus', async () => {
    render(
      <HoloModal open onClose={() => {}} ariaLabel="Focus dialog">
        <button hidden>Hidden</button>
        <button disabled tabIndex={0}>Disabled</button>
        <button tabIndex={-1}>Programmatic only</button>
        <div style={{ display: 'none' }}><button>CSS hidden</button></div>
        <fieldset disabled><legend><button>Legend action</button></legend><button>Fieldset disabled</button></fieldset>
        <button>Last</button>
      </HoloModal>
    )
    const first = screen.getByRole('button', { name: 'Legend action' })
    const last = screen.getByRole('button', { name: 'Last' })
    await flushFocus()
    expect(document.activeElement).toBe(first)
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(first)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  it('restores focus after closing', async () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()
    const { rerender } = render(<HoloModal open onClose={() => {}} ariaLabel="Restoring dialog"><button>Action</button></HoloModal>)
    await flushFocus()
    rerender(<HoloModal open={false} onClose={() => {}} ariaLabel="Restoring dialog"><button>Action</button></HoloModal>)
    expect(document.activeElement).toBe(trigger)
    trigger.remove()
  })

  it('cycles through editable and media controls', async () => {
    render(
      <HoloModal open onClose={() => {}} ariaLabel="Native controls dialog">
        <div contentEditable suppressContentEditableWarning>Editable</div>
        <audio controls tabIndex={0} aria-label="Audio control" />
        <video controls tabIndex={0} aria-label="Video control" />
      </HoloModal>
    )
    const dialog = screen.getByRole('dialog', { name: 'Native controls dialog' })
    const [editable, audio, video] = Array.from(dialog.querySelectorAll<HTMLElement>('[contenteditable], audio, video'))
    await flushFocus()
    expect(document.activeElement).toBe(editable)
    video.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(editable)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(video)
    audio.focus()
    expect(document.activeElement).toBe(audio)
  })
})
