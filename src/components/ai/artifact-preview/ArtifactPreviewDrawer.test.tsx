import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ArtifactPreviewDrawer } from './ArtifactPreviewDrawer'
import { getFocusableElements } from '@/utils/focus'

const flushFocus = () => new Promise(resolve => setTimeout(resolve, 0))

describe('ArtifactPreviewDrawer', () => {
  it('locks background scrolling and constrains its responsive width', () => {
    const { rerender } = render(<ArtifactPreviewDrawer artifact={{ id: 'responsive', type: 'html', title: 'Responsive', content: '<p>Hello</p>' }} onClose={() => {}} constrainToViewport />)
    expect(document.body.style.overflow).toBe('hidden')
    expect(screen.getByRole('dialog').style.maxWidth).toBe('calc(100vw - 16px)')
    rerender(<ArtifactPreviewDrawer artifact={null} onClose={() => {}} />)
    expect(document.body.style.overflow).toBe('')
  })

  it('preserves caller-provided width without implicit constraints', () => {
    render(<ArtifactPreviewDrawer artifact={{ id: 'width', type: 'html', title: 'Width', content: '<p>Hello</p>' }} onClose={() => {}} width="240px" />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.style.width).toBe('240px')
    expect(dialog.style.minWidth).toBe('')
    expect(dialog.style.maxWidth).toBe('')
  })
  it('provides dialog semantics and closes with Escape', async () => {
    const onClose = vi.fn()
    render(<ArtifactPreviewDrawer artifact={{ id: 'one', type: 'html', title: 'Preview', content: '<p>Hello</p>' }} onClose={onClose} />)
    expect(screen.getByRole('dialog', { name: 'Preview' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Close' })).toBeDefined()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes when Escape is pressed inside the HTML preview iframe', () => {
    const onClose = vi.fn()
    render(<ArtifactPreviewDrawer artifact={{ id: 'iframe-escape', type: 'html', title: 'Iframe preview', content: '<p>Hello</p>' }} onClose={onClose} />)
    const frame = screen.getByTitle('HTML Preview') as HTMLIFrameElement
    fireEvent.load(frame)
    frame.contentDocument?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
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

  it('does not reset focus when the parent supplies a new inline close callback', async () => {
    const artifact = { id: 'stable-focus', type: 'html', title: 'Stable focus', content: '<input />' }
    const { rerender } = render(<ArtifactPreviewDrawer artifact={artifact} onClose={() => {}} />)
    await flushFocus()
    const copyButton = screen.getByRole('button', { name: 'Copy' })
    copyButton.focus()
    rerender(<ArtifactPreviewDrawer artifact={{ ...artifact }} onClose={() => {}} />)
    expect(document.activeElement).toBe(copyButton)
  })

  it('preserves the 0.1.2 centered and constrained SVG presentation', () => {
    const content = '<svg><image href="https://example.com/pixel.png"/><script>fetch("https://example.com")</script></svg>'
    render(<ArtifactPreviewDrawer artifact={{ id: 'svg', type: 'svg', title: 'SVG Preview', content }} onClose={() => {}} />)
    const svg = document.querySelector('svg image[href="https://example.com/pixel.png"]')?.closest('svg')
    expect(svg).not.toBeNull()
    expect(svg?.parentElement?.className).toContain('[&_svg]:max-w-full')
    expect(svg?.parentElement?.className).toContain('[&_svg]:max-h-full')
    expect(svg?.parentElement?.className).toContain('h-full')
    expect(svg?.parentElement?.className).toContain('w-full')
  })

  it('preserves remote image rendering from 0.1.2', () => {
    render(<ArtifactPreviewDrawer artifact={{ id: 'remote-image', type: 'image', title: 'Remote image', content: 'https://tracker.example/pixel.png' }} onClose={() => {}} />)
    expect(screen.getByRole('img', { name: 'Remote image' }).getAttribute('src')).toBe('https://tracker.example/pixel.png')
  })
})
