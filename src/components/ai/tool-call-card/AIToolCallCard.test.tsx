import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AIToolCallCard } from './AIToolCallCard'

describe('AIToolCallCard', () => {
  it('exposes expandable payload details', () => {
    const { container } = render(<AIToolCallCard name="read_file" status="complete" arguments='{"path":"README.md"}' result='{"ok":true}' durationMs={245} />)

    const trigger = screen.getByRole('button', { name: /read_file/i })
    const card = container.querySelector('[data-shd-tool-card="true"]')
    expect(card?.getAttribute('data-shd-state')).toBe('complete')
    expect(card?.className).toContain('shd-status-glass')
    expect(container.firstElementChild?.className).not.toContain('my-2')
    expect(trigger.className).toContain('box-border')
    expect(trigger.getAttribute('aria-label')).toContain('Complete')
    expect(trigger.className).toContain('border-none')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByText('245ms')).toBeDefined()
    expect(screen.getByText('Complete').className).toContain('shd-status-text')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('region')).toBeDefined()
    expect(card?.getAttribute('data-shd-open')).toBe('true')
    expect(screen.getByText('Arguments')).toBeDefined()
    expect(screen.getByText('Result')).toBeDefined()
    expect(screen.getAllByRole('button', { name: /copy/i }).every(button => button.getAttribute('data-shd-copy-action') === 'true')).toBe(true)
  })

  it('does not advertise expansion without details', () => {
    render(<AIToolCallCard name="queued_tool" status="pending" />)
    const trigger = screen.getByRole('button', { name: /queued_tool/i })
    expect(trigger.getAttribute('aria-label')).toContain('Pending')
    expect(trigger.hasAttribute('aria-expanded')).toBe(false)
    expect(trigger.hasAttribute('aria-controls')).toBe(false)
    expect(trigger.hasAttribute('disabled')).toBe(true)
  })

  it('does not expose an empty disclosure for an error without payload', () => {
    const { container } = render(<AIToolCallCard name="failed_tool" status="error" />)
    const trigger = screen.getByRole('button', { name: /failed_tool, Failed/i })
    expect(container.querySelector('[data-shd-tool-card="true"]')?.getAttribute('data-shd-state')).toBe('error')
    expect(screen.getByText('Failed').className).toContain('shd-status-text')
    expect(trigger.hasAttribute('aria-expanded')).toBe(false)
    expect(trigger.hasAttribute('disabled')).toBe(true)
  })
})
