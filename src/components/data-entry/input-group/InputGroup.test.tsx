import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloInput } from '@/components/data-entry/input'
import { IconButton } from '@/components/general/icon-button'
import { HoloInputGroup } from './InputGroup'

describe('HoloInputGroup', () => {
  it('preserves an explicit child status when the group has no status', () => {
    const { container } = render(<HoloInputGroup><HoloInput aria-label="Query" status="error" /></HoloInputGroup>)
    expect(container.querySelector('[aria-invalid="true"]')).toBeDefined()
  })
  it('keeps semantic status on keyboard focus without an outer frame', () => {
    const originalMatches = HTMLElement.prototype.matches
    const matches = vi.spyOn(HTMLElement.prototype, 'matches').mockImplementation(function (this: HTMLElement, selector) {
      return selector === ':focus-visible' ? this.tagName === 'INPUT' : originalMatches.call(this, selector)
    })
    const { container } = render(<HoloInputGroup status="error"><HoloInput aria-label="Query" /></HoloInputGroup>)

    fireEvent.focus(screen.getByRole('textbox', { name: 'Query' }))
    expect(container.firstElementChild?.className).toContain('border-stroke-error')
    expect(container.firstElementChild?.className).not.toContain('shd-focus-frame')
    matches.mockRestore()
  })

  it('updates group focus visibility when focus moves to another child', () => {
    const originalMatches = HTMLElement.prototype.matches
    const matches = vi.spyOn(HTMLElement.prototype, 'matches').mockImplementation(function (this: HTMLElement, selector) {
      return selector === ':focus-visible' ? true : originalMatches.call(this, selector)
    })
    const { container } = render(
      <HoloInputGroup>
        <HoloInput aria-label="Query" />
        <IconButton title="Submit">→</IconButton>
      </HoloInputGroup>,
    )

    const submit = screen.getByTitle('Submit')
    fireEvent.focus(screen.getByRole('textbox', { name: 'Query' }))
    expect(container.firstElementChild?.className).toContain('border-stroke-accent-strong')
    expect(container.firstElementChild?.className).not.toContain('shd-focus-frame')
    fireEvent.blur(screen.getByRole('textbox', { name: 'Query' }), { relatedTarget: submit })
    fireEvent.focus(submit)
    expect(container.firstElementChild?.className).not.toContain('shd-focus-frame')
    expect(submit.className).toContain('shd-control-focus')
    matches.mockRestore()
  })
})
