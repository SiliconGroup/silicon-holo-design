import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoloTag } from './Tag'

describe('HoloTag', () => {
  it('maps spectrum variants to semantic soft roles', () => {
    render(<><HoloTag color="blue">Blue</HoloTag><HoloTag color="purple">Purple</HoloTag></>)
    expect(screen.getByText('Blue').parentElement?.className).toContain('bg-accent-blue-soft')
    expect(screen.getByText('Purple').parentElement?.className).toContain('bg-accent-purple-soft')
  })
})
