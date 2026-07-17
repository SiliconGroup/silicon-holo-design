import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloNumberInput } from './NumberInput'

describe('HoloNumberInput', () => {
  it('provides keyboard-focusable increment and decrement controls', () => {
    const onChange = vi.fn()
    render(<HoloNumberInput value={5} onChange={onChange} />)
    const decrement = screen.getByRole('button', { name: 'Decrease value' })
    const increment = screen.getByRole('button', { name: 'Increase value' })

    expect(decrement.className).toContain('shd-control-focus')
    expect(increment.className).toContain('shd-control-focus')
    expect(decrement.className).toContain('bg-transparent')
    expect(increment.className).toContain('bg-transparent')
    fireEvent.click(decrement)
    fireEvent.click(increment)
    expect(onChange).toHaveBeenNthCalledWith(1, 4)
    expect(onChange).toHaveBeenNthCalledWith(2, 6)
  })
})
