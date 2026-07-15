import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AIToolCallGroup } from './AIToolCallGroup'
import type { ChatMessage } from '@/types'

const completeMessages: ChatMessage[] = [
  { id: 'one', role: 'tool', content: '', toolName: 'read_file', toolStatus: 'complete', toolDuration: 100 },
  { id: 'two', role: 'tool', content: '', toolName: 'write_file', toolStatus: 'complete', toolDuration: 250 },
]

describe('AIToolCallGroup', () => {
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

    expect(screen.getByRole('button', { name: /Running: run_build/i }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('1/2 complete')).toBeDefined()
    expect(screen.getByRole('region')).toBeDefined()
  })
})
