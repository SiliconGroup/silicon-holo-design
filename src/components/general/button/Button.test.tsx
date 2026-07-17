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

  it('preserves custom classes and focus-visible styling', () => {
    render(<HoloButton className="consumer-class">Styled</HoloButton>)
    const button = screen.getByRole('button', { name: 'Styled' })
    expect(button.className).toContain('consumer-class')
    expect(button.className).toContain('shd-control-focus')
    expect(button.className).not.toContain('ring-offset')
  })

  it('does not submit forms by default and allows an explicit submit type', () => {
    let submitted = 0
    const { rerender } = render(<form onSubmit={(event) => { event.preventDefault(); submitted += 1 }}><HoloButton>Safe action</HoloButton></form>)
    fireEvent.click(screen.getByRole('button', { name: 'Safe action' }))
    expect(submitted).toBe(0)

    rerender(<form onSubmit={(event) => { event.preventDefault(); submitted += 1 }}><HoloButton type="submit">Submit action</HoloButton></form>)
    fireEvent.click(screen.getByRole('button', { name: 'Submit action' }))
    expect(submitted).toBe(1)
  })

  it('keeps semantic status color families on hover', () => {
    render(<><HoloButton variant="success">Success</HoloButton><HoloButton variant="warning">Warning</HoloButton><HoloButton variant="danger">Danger</HoloButton></>)
    for (const name of ['Success', 'Warning', 'Danger']) {
      const button = screen.getByRole('button', { name })
      expect(button.className).not.toContain('hover:bg-surface-interactive-hover')
      expect(button.className).toContain(`var(--shd-status-${name === 'Danger' ? 'error' : name.toLowerCase()})`)
    }
  })
})
