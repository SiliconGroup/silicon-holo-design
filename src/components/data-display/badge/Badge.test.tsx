import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoloBadge } from './Badge'

describe('HoloBadge', () => {
  it('uses a tonal semantic treatment for counts', () => {
    render(<HoloBadge count={4}><button>Inbox</button></HoloBadge>)
    const badge = screen.getByText('4')
    expect(badge.className).toContain('bg-accent-primary-soft')
    expect(badge.className).toContain('border-stroke-accent')
  })
})
