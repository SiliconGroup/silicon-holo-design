import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AIToolExecutionCard } from './AIToolExecutionCard'

describe('AIToolExecutionCard', () => {
  it('renders error diagnostics', () => {
    const { container } = render(<AIToolExecutionCard toolName="Validate output" status="error" result="Contrast threshold not met" />)
    expect(container.querySelector('[data-shd-tool-execution="true"]')?.getAttribute('data-shd-state')).toBe('error')
    expect(screen.getByText('Failed').className).toContain('shd-status-text')
    expect(screen.getByText('Contrast threshold not met')).toBeDefined()
  })
})
