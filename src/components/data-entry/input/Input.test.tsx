import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloInput } from './Input'

describe('HoloInput', () => {
  it('emits controlled values and exposes invalid state', () => {
    let value = ''
    render(<HoloInput aria-label="Name" status="error" onChange={next => { value = next }} />)
    const input = screen.getByRole('textbox', { name: 'Name' })
    fireEvent.change(input, { target: { value: 'Ada' } })
    expect(value).toBe('Ada')
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })
})
