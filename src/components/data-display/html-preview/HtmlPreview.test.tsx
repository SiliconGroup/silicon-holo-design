import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { HtmlPreviewBlock } from './HtmlPreview'

describe('HtmlPreviewBlock', () => {
  it('renders on the server without browser globals', () => {
    expect(() => renderToString(<HtmlPreviewBlock code="<div>SSR</div>" />)).not.toThrow()
  })

  it('preserves the 0.1.2 executable preview contract', async () => {
    const code = '<!doctype html><html><head><link rel="stylesheet" href="https://cdn.example/theme.css"></head><body><script src="https://cdn.example/app.js"></script></body></html>'
    render(<HtmlPreviewBlock code={code} />)
    fireEvent.click(screen.getByRole('tab', { name: /preview/i }))

    const iframe = await screen.findByTitle('HTML Preview')
    expect(iframe.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin')
    expect(iframe.getAttribute('srcdoc')).toBe(code)
  })

  it('re-highlights updated code content', () => {
    const { container, rerender } = render(<HtmlPreviewBlock code="<div>First</div>" />)
    expect(container.querySelector('code')?.textContent).toContain('First')
    rerender(<HtmlPreviewBlock code="<section>Second</section>" />)
    expect(container.querySelector('code')?.textContent).toContain('Second')
    expect(container.querySelector('code')?.textContent).not.toContain('First')
  })

})
