import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloTextarea } from './Textarea'

describe('HoloTextarea', () => {
  it('composes submit, key, focus, and blur handlers', () => {
    const onSubmit = vi.fn()
    const onKeyDown = vi.fn()
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    const { container } = render(
      <HoloTextarea aria-label="Notes" onSubmit={onSubmit} onKeyDown={onKeyDown} onFocus={onFocus} onBlur={onBlur} />,
    )
    const textarea = screen.getByRole('textbox', { name: 'Notes' })

    fireEvent.focus(textarea)
    expect(onFocus).toHaveBeenCalledOnce()
    expect(container.firstElementChild?.className).toContain('border-stroke-accent')
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onKeyDown).toHaveBeenCalledOnce()
    fireEvent.blur(textarea)
    expect(onBlur).toHaveBeenCalledOnce()
  })

  it('preserves a consumer-provided native aria-invalid value', () => {
    render(<HoloTextarea aria-label="Spelling" aria-invalid="spelling" />)
    expect(screen.getByRole('textbox', { name: 'Spelling' }).getAttribute('aria-invalid')).toBe('spelling')
  })
})
