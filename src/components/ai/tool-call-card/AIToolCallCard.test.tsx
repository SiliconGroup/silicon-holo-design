import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AIToolCallCard } from './AIToolCallCard'

describe('AIToolCallCard', () => {
  it('exposes expandable payload details', () => {
    render(<AIToolCallCard name="read_file" status="complete" arguments='{"path":"README.md"}' result='{"ok":true}' durationMs={245} />)

    const trigger = screen.getByRole('button', { name: /read_file/i })
    expect(trigger.className).toContain('border-none')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByText('245ms')).toBeDefined()

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('region')).toBeDefined()
    expect(screen.getByText('Arguments')).toBeDefined()
    expect(screen.getByText('Result')).toBeDefined()
    expect(screen.getAllByRole('button', { name: /copy/i }).every(button => button.className.includes('border-none'))).toBe(true)
  })

  it('does not advertise expansion without details', () => {
    render(<AIToolCallCard name="queued_tool" status="pending" />)
    const trigger = screen.getByRole('button', { name: /queued_tool/i })
    expect(trigger.hasAttribute('aria-expanded')).toBe(false)
    expect(trigger.hasAttribute('aria-controls')).toBe(false)
    expect(trigger.hasAttribute('disabled')).toBe(true)
  })
})
