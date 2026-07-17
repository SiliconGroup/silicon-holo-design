import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoloFormItem } from './FormItem'
import { HoloSelect } from '../select/Select'

describe('HoloFormItem', () => {
  it('associates its label and help text with a select control', () => {
    render(
      <HoloFormItem label="Framework" helpText="Choose one framework">
        <HoloSelect options={[{ value: 'react', label: 'React' }]} value="" onChange={() => undefined} />
      </HoloFormItem>,
    )

    const control = screen.getByRole('combobox', { name: 'Framework' })
    expect(screen.getByLabelText('Framework')).toBe(control)
    expect(control.getAttribute('aria-describedby')).toBe(screen.getByText('Choose one framework').id)
  })
})
