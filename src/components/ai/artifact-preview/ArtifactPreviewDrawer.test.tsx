import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ArtifactPreviewDrawer } from './ArtifactPreviewDrawer'
import { getFocusableElements } from '@/utils/focus'

const flushFocus = () => new Promise(resolve => setTimeout(resolve, 0))

describe('ArtifactPreviewDrawer', () => {
  it('provides dialog semantics and closes with Escape', async () => {
    const onClose = vi.fn()
    render(<ArtifactPreviewDrawer artifact={{ id: 'one', type: 'html', title: 'Preview', content: '<p>Hello</p>' }} onClose={onClose} />)
    expect(screen.getByRole('dialog', { name: 'Preview' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Close' })).toBeDefined()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('traps focus across its visible controls and restores the opener', async () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()
    const artifact = { id: 'two', type: 'html', title: 'Focusable preview', content: '<p>Hello</p>' }
    const { rerender } = render(<ArtifactPreviewDrawer artifact={artifact} onClose={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: 'Focusable preview' })
    await flushFocus()
    const focusable = getFocusableElements(dialog)
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    expect(document.activeElement).toBe(first)
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(first)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
    rerender(<ArtifactPreviewDrawer artifact={null} onClose={() => {}} />)
    expect(document.activeElement).toBe(trigger)
    trigger.remove()
  })
})
