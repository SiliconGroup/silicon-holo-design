import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AIToolCallGroup } from './AIToolCallGroup'
import type { ChatMessage } from '@/types'

const completeMessages: ChatMessage[] = [
  { id: 'one', role: 'tool', content: '', toolName: 'read_file', toolStatus: 'complete', toolDuration: 100 },
  { id: 'two', role: 'tool', content: '', toolName: 'write_file', toolStatus: 'complete', toolDuration: 250 },
]

describe('AIToolCallGroup', () => {
  it('uses the same outer rhythm for single and multi-tool groups', () => {
    const single = render(<AIToolCallGroup messages={[completeMessages[0]]} />)
    expect(single.container.firstElementChild?.className).toContain('my-4')
    expect(single.container.querySelector('.max-w-\\[78\\%\\]')).toBeDefined()
    expect(single.container.firstElementChild?.className).not.toContain('px-2')
    single.unmount()

    const multiple = render(<AIToolCallGroup messages={completeMessages} />)
    expect(multiple.container.firstElementChild?.className).toContain('my-4')
    expect(multiple.container.querySelector('[data-shd-tool-group]')?.className).toContain('max-w-[78%]')
    expect(multiple.container.querySelector('[data-shd-tool-group]')?.className).toContain('shd-spectral-glass')
    expect(multiple.container.querySelector('[data-shd-tool-group]')?.className).not.toContain('shd-status-glass')
    expect(multiple.container.firstElementChild?.className).not.toContain('px-2')
  })

  it('collapses completed groups and exposes an accessible region', () => {
    render(<AIToolCallGroup messages={completeMessages} />)

    const group = screen.getByRole('group', { name: 'Tool execution group' })
    const trigger = screen.getByRole('button', { name: /2 tools executed/i })
    expect(group).toBeDefined()
    expect(trigger.className).toContain('border-none')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('region')).toBeNull()

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('region')).toBeDefined()
    expect(screen.getByText('350ms')).toBeDefined()
  })

  it('keeps running groups expanded with progress', () => {
    const messages: ChatMessage[] = [
      completeMessages[0],
      { id: 'running', role: 'tool', content: '', toolName: 'run_build', toolStatus: 'running' },
    ]
    render(<AIToolCallGroup messages={messages} />)

    expect(screen.queryByRole('button', { name: /Running: run_build/i })).toBeNull()
    expect(screen.getByRole('status', { name: /Running: run_build/i }).className).toContain('box-border')
    expect(screen.getByText('1/2 complete')).toBeDefined()
    expect(screen.getByText('1/2 complete').className).toContain('shrink-0')
    expect(screen.getByText('1/2 complete').className).toContain('whitespace-nowrap')
    expect(screen.getByText(/Running: run_build/).className).toContain('truncate')
    expect(screen.getByRole('region')).toBeDefined()
  })

  it('reports pending groups without a false success state', () => {
    const messages: ChatMessage[] = [
      completeMessages[0],
      { id: 'pending', role: 'tool', content: '', toolName: 'await_approval', toolStatus: 'pending' },
    ]
    render(<AIToolCallGroup messages={messages} />)

    expect(screen.getByRole('status', { name: /Pending/i }).getAttribute('aria-label')).not.toContain('Complete')
    expect(screen.getByText('1/2 complete')).toBeDefined()
  })

  it('treats omitted tool status consistently as pending', () => {
    const messages: ChatMessage[] = [
      { id: 'implicit', role: 'tool', content: '', toolName: 'await_status' },
      completeMessages[0],
    ]
    render(<AIToolCallGroup messages={messages} />)

    expect(screen.getByRole('status', { name: /Pending/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /await_status, Pending/i })).toBeDefined()
  })

  it('prioritizes errors and does not count them as completed', () => {
    const messages: ChatMessage[] = [
      { id: 'error', role: 'tool', content: '', toolName: 'validate_output', toolStatus: 'error' },
      { id: 'running', role: 'tool', content: '', toolName: 'continue_build', toolStatus: 'running' },
    ]
    render(<AIToolCallGroup messages={messages} />)
    expect(screen.getByRole('status', { name: /Failed/i })).toBeDefined()
    expect(screen.getByText('0/2 complete')).toBeDefined()
  })
})
