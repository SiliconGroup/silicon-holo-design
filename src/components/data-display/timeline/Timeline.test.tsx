import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoloTimeline } from './Timeline'

describe('HoloTimeline', () => {
  it('centers timeline markers on the vertical rail', () => {
    const { container } = render(<HoloTimeline items={[{ title: 'Created' }]} />)
    const rail = container.querySelector('.left-\\[5px\\]')
    const marker = container.querySelector('.w-3.h-3')
    expect(rail).toBeDefined()
    expect(marker?.className).not.toContain('-translate-x-1')
  })

  it('uses the semantic on-accent foreground for marker icons', () => {
    render(<HoloTimeline items={[{ title: 'Created', icon: '1' }]} />)
    expect(screen.getByText('1').className).toContain('text-content-on-accent')
  })
})
