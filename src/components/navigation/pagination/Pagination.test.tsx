import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoloPagination } from './Pagination'

describe('HoloPagination', () => {
  it('exposes page labels and the current page state', () => {
    render(<HoloPagination current={2} total={50} pageSize={10} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Page 1' }).className).toContain('bg-transparent')
    expect(screen.getByRole('button', { name: 'Previous page' }).className).toContain('bg-transparent')
    expect(screen.getByRole('button', { name: 'Page 2' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('button', { name: 'Page 2' }).className).toContain('bg-surface-selected')
    expect(screen.getByRole('button', { name: 'Page 3' })).toBeDefined()
  })

  it('clamps a stale current page after totals shrink', () => {
    const onChange = vi.fn()
    render(<HoloPagination current={10} total={30} pageSize={10} onChange={onChange} />)
    expect(screen.getByRole('button', { name: 'Page 3' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('button', { name: 'Next page' }).hasAttribute('disabled')).toBe(true)
  })

  it('falls back from an invalid page size', () => {
    render(<HoloPagination current={1} total={100} pageSize={0} onChange={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Page Infinity' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Page 10' })).toBeDefined()
  })
})
