import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloCollapse } from './Collapse'

const items = [
  { key: 'one', title: 'One', content: 'First panel' },
  { key: 'two', title: 'Two', content: 'Second panel' },
]

describe('HoloCollapse', () => {
  it('supports uncontrolled accordion disclosure', () => {
    render(<HoloCollapse items={items} accordion />)
    const trigger = screen.getByRole('button', { name: 'One' })
    expect(trigger.className).toContain('border-none')
    expect(trigger.className).toContain('shd-local-focus')
    fireEvent.click(trigger)
    expect(screen.getByText('First panel')).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Two' }))
    expect(screen.queryByText('First panel')).toBeNull()
    expect(screen.getByText('Second panel')).toBeDefined()
  })

  it('reports controlled changes without mutating controlled state', () => {
    let nextKeys: string[] = []
    render(<HoloCollapse items={items} activeKeys={['one']} onChange={keys => { nextKeys = keys }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Two' }))
    expect(nextKeys).toEqual(['one', 'two'])
    expect(screen.queryByText('Second panel')).toBeNull()
  })
})
