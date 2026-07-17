import { describe, expect, it, vi } from 'vitest'
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

  it('brightens the existing border without adding an outer focus frame', () => {
    const { container } = render(<HoloInput aria-label="Mouse focus" />)
    const input = screen.getByRole('textbox', { name: 'Mouse focus' })
    const originalMatches = HTMLInputElement.prototype.matches
    let focusVisible = false
    const matches = vi.spyOn(HTMLInputElement.prototype, 'matches').mockImplementation(function (this: HTMLInputElement, selector) {
      return selector === ':focus-visible' ? focusVisible : originalMatches.call(this, selector)
    })

    fireEvent.focus(input)
    expect(container.firstElementChild?.className).not.toContain('shd-focus-frame')
    expect(container.firstElementChild?.className).toContain('border-stroke-accent')

    fireEvent.blur(input)
    focusVisible = true
    fireEvent.focus(input)
    expect(container.firstElementChild?.className).not.toContain('shd-focus-frame')
    expect(container.firstElementChild?.className).toContain('border-stroke-accent-strong')
    matches.mockRestore()
  })

  it('composes consumer focus handlers with internal visual state', () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    const { container } = render(<HoloInput aria-label="Composed focus" onFocus={onFocus} onBlur={onBlur} />)
    const input = screen.getByRole('textbox', { name: 'Composed focus' })

    fireEvent.focus(input)
    expect(onFocus).toHaveBeenCalledOnce()
    expect(container.firstElementChild?.className).toContain('border-stroke-accent')
    fireEvent.blur(input)
    expect(onBlur).toHaveBeenCalledOnce()
  })

  it('preserves a consumer-provided native aria-invalid value', () => {
    render(<HoloInput aria-label="Grammar" aria-invalid="grammar" />)
    expect(screen.getByRole('textbox', { name: 'Grammar' }).getAttribute('aria-invalid')).toBe('grammar')
  })
})
