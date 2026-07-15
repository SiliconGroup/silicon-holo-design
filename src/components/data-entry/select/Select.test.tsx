import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloSelect } from './Select'

describe('HoloSelect', () => {
  it('accepts an accessible name without changing its selection API', () => {
    render(<HoloSelect aria-label="Framework" options={[]} value="" onChange={() => undefined} />)
    expect(screen.getByRole('combobox', { name: 'Framework' })).toBeDefined()
  })

  it('opens an accessible listbox and selects a value', () => {
    let value: string | string[] = ''
    render(<HoloSelect options={[{ value: 'react', label: 'React' }]} value="" onChange={next => { value = next }} />)
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(screen.getByRole('option', { name: 'React' }))
    expect(value).toBe('react')
  })

  it('opens, navigates enabled options, selects, and restores focus with the keyboard', () => {
    let value: string | string[] = ''
    render(
      <HoloSelect
        options={[
          { value: 'disabled', label: 'Disabled', disabled: true },
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue' },
        ]}
        value=""
        onChange={next => { value = next }}
      />,
    )

    const trigger = screen.getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-activedescendant')).toContain('option-1')

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger.getAttribute('aria-activedescendant')).toContain('option-2')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(value).toBe('vue')
    expect(document.activeElement).toBe(trigger)

    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('does not intercept editing keys inside the searchable input', () => {
    render(
      <HoloSelect
        searchable
        options={[{ value: 'new-york', label: 'New York' }]}
        value=""
        onChange={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('combobox'))
    const input = screen.getByPlaceholderText('Search...')
    expect(fireEvent.keyDown(input, { key: ' ' })).toBe(true)
    expect(fireEvent.keyDown(input, { key: 'ArrowDown' })).toBe(true)
    expect(fireEvent.keyDown(input, { key: 'Enter' })).toBe(true)
    fireEvent.change(input, { target: { value: 'New York' } })
    expect((input as HTMLInputElement).value).toBe('New York')
    expect(screen.getByRole('listbox')).toBeDefined()
  })
})
