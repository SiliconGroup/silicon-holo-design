import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AIToolExecutionCard } from './AIToolExecutionCard'

describe('AIToolExecutionCard', () => {
  it('renders error diagnostics', () => {
    render(<AIToolExecutionCard toolName="Validate output" status="error" result="Contrast threshold not met" />)
    expect(screen.getByText('Contrast threshold not met')).toBeDefined()
  })
})
