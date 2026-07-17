import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoloAlert } from './Alert'

describe('HoloAlert', () => {
  it.each([
    ['info', 'bg-accent-primary-softer'],
    ['success', 'bg-state-success-soft'],
    ['warning', 'bg-state-warning-soft'],
    ['error', 'bg-state-error-soft'],
  ] as const)('uses a tonal %s surface with a neutral border', (type, surfaceClass) => {
    render(<HoloAlert type={type} title={`${type} message`} />)
    const alert = screen.getByText(`${type} message`).closest('[role]')
    expect(alert?.className).toContain(surfaceClass)
    expect(alert?.className).toContain('border-stroke-subtle')
    expect(alert?.className).not.toContain(`border-stroke-${type}`)
  })

  it('reserves assertive alert semantics for warning and error states', () => {
    const { rerender } = render(<HoloAlert type="info" title="Information" />)
    expect(screen.getByRole('status')).toBeDefined()
    rerender(<HoloAlert type="error" title="Failure" />)
    expect(screen.getByRole('alert')).toBeDefined()
  })
})
