import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { AIMessageBubble } from './AIMessageBubble'

const htmlMessage = {
  id: 'html-artifact',
  role: 'assistant' as const,
  content: '```html\n<!doctype html><html><body>Preview</body></html>\n```',
}

describe('AIMessageBubble', () => {
  it('renders fenced code as a technical inset block while keeping inline code lightweight', () => {
    const { container } = render(<AIMessageBubble message={{
      id: 'code-material',
      role: 'assistant',
      content: 'Use `surface-base` here.\n\n```ts\nconst surface = "base"\n```',
    }} />)

    const block = container.querySelector('[data-shd-markdown-code-block="true"]')
    const markdown = container.querySelector('.shd-markdown-content')
    const inline = screen.getByText('surface-base')
    expect(block?.className).toContain('shd-markdown-code-block')
    expect(block?.textContent).toContain('const surface = "base"')
    expect(screen.getByText('ts').className).toContain('uppercase')
    expect(screen.getByRole('button', { name: /Copy ts/i })).toBeDefined()
    expect(inline.getAttribute('data-shd-inline-code')).toBe('true')
    expect(inline.closest('[data-shd-markdown-code-block]')).toBeNull()
    expect(markdown).toBeDefined()
  })

  it('aligns standalone tool rows with the shared message track', () => {
    const { container } = render(<AIMessageBubble message={{ id: 'tool-track', role: 'tool', content: '', toolName: 'inspect_tokens', toolStatus: 'complete' }} />)
    expect(container.firstElementChild?.className).not.toContain('px-2')
    expect(container.firstElementChild?.className).toContain('my-4')
    expect(container.querySelector('.max-w-\\[78\\%\\]')).toBeDefined()
  })

  it('exposes artifact preview as a native keyboard-operable button', () => {
    const onOpenArtifact = vi.fn()
    render(<AIMessageBubble message={htmlMessage} onOpenArtifact={onOpenArtifact} />)
    const preview = screen.getAllByRole('button', { name: /html/i })[0]
    fireEvent.keyDown(preview, { key: 'Enter' })
    fireEvent.click(preview)
    expect(onOpenArtifact).toHaveBeenCalledOnce()
  })

  it('keeps hook order stable when a message changes between assistant and tool roles', () => {
    const { rerender } = render(<AIMessageBubble message={{ id: 'changing', role: 'assistant', content: 'Ready' }} />)
    expect(screen.getByText('Ready')).toBeDefined()

    rerender(<AIMessageBubble message={{ id: 'changing', role: 'tool', content: '', toolName: 'inspect_tokens', toolStatus: 'complete' }} />)
    expect(screen.getByText('inspect_tokens')).toBeDefined()
  })

  it('keeps artifact identity stable across rerenders', () => {
    const onOpenArtifact = vi.fn()
    const { rerender } = render(<AIMessageBubble message={htmlMessage} onOpenArtifact={onOpenArtifact} />)
    fireEvent.click(screen.getAllByRole('button', { name: /html/i })[0])
    const firstId = onOpenArtifact.mock.calls[0][0].id
    rerender(<AIMessageBubble message={htmlMessage} onOpenArtifact={onOpenArtifact} enableCopy />)
    fireEvent.click(screen.getAllByRole('button', { name: /html/i })[0])
    expect(onOpenArtifact.mock.calls[1][0].id).toBe(firstId)
  })

  it('hydrates ISO timestamps deterministically before localizing them in the browser', async () => {
    const serverMarkup = renderToString(<AIMessageBubble message={{ id: 'server-timestamp', role: 'assistant', content: 'Time', timestamp: '2026-07-15T08:09:10.000Z' }} />)
    expect(serverMarkup).toContain('08:09:10')
    render(<AIMessageBubble message={{ id: 'timestamp', role: 'assistant', content: 'Time', timestamp: '2026-07-15T08:09:10.000Z' }} />)
    await waitFor(() => expect(screen.getByText(new Date('2026-07-15T08:09:10.000Z').toLocaleTimeString())).toBeDefined())
    render(<AIMessageBubble message={{ id: 'invalid-timestamp', role: 'assistant', content: 'Invalid', timestamp: 'not-a-date' }} />)
    expect(screen.getByText('not-a-date')).toBeDefined()
  })
})
