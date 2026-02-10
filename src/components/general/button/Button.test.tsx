import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HoloButton } from './Button'

describe('HoloButton', () => {
  it('renders children', () => {
    render(<HoloButton>Click me</HoloButton>)
    expect(screen.getByText('Click me')).toBeDefined()
  })

  it('handles click', () => {
    let clicked = false
    render(<HoloButton onClick={() => { clicked = true }}>Click</HoloButton>)
    fireEvent.click(screen.getByText('Click'))
    expect(clicked).toBe(true)
  })

  it('respects disabled state', () => {
    render(<HoloButton disabled>Disabled</HoloButton>)
    expect(screen.getByText('Disabled').closest('button')?.disabled).toBe(true)
  })
})
