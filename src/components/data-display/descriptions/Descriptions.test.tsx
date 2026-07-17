import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoloDescriptions } from './Descriptions'

const items = [
  { label: 'Name', value: 'Silicon Holo' },
  { label: 'Long value', value: 'a-very-long-continuous-value-that-must-wrap-without-overflow' },
]

describe('HoloDescriptions', () => {
  it('uses a constrained two-track layout for horizontal descriptions', () => {
    const { container } = render(<HoloDescriptions items={items} layout="horizontal" />)
    expect(container.firstElementChild?.className).toContain('border-stroke-subtle')
    expect(screen.getByText('Name').parentElement?.className).toContain('grid-cols-[')
    expect(screen.getByText(/a-very-long/).className).toContain('break-words')
  })

  it('supports responsive card columns for vertical descriptions', () => {
    const { container } = render(<HoloDescriptions items={items} layout="vertical" column={2} />)
    expect((container.firstElementChild as HTMLElement).style.gridTemplateColumns).toContain('repeat(2')
    expect(screen.getByText('Name').parentElement?.className).toContain('bg-surface-interactive')
  })
})
