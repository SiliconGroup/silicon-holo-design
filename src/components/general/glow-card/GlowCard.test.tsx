import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlowCard } from './GlowCard'

describe('GlowCard', () => {
  it('provides a semantic foreground for every surface variant', () => {
    const { rerender } = render(<GlowCard variant="default">Default card</GlowCard>)
    expect(screen.getByText('Default card').className).toContain('text-content-primary')
    rerender(<GlowCard variant="elevated">Elevated card</GlowCard>)
    expect(screen.getByText('Elevated card').className).toContain('text-content-primary')
  })
})
