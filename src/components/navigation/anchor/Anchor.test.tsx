import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloAnchor } from './Anchor'

describe('HoloAnchor', () => {
  it('uses native buttons and scrolls without forcing smooth motion', () => {
    const target = document.createElement('section')
    target.id = 'target'
    target.scrollIntoView = vi.fn()
    document.body.appendChild(target)
    const onChange = vi.fn()
    render(<HoloAnchor items={[{ key: 'target', title: 'Target', href: '#target' }]} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Target' }))
    expect(onChange).toHaveBeenCalledWith('target')
    expect(target.scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
    target.remove()
  })
})
