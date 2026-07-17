import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatBubble } from './ChatBubble'

describe('ChatBubble', () => {
  it('uses distinct flat holographic materials for assistant and user messages', () => {
    render(<><ChatBubble align="left">Assistant</ChatBubble><ChatBubble align="right">User</ChatBubble></>)
    const assistant = screen.getByText('Assistant').closest('[data-shd-chat-bubble]')
    const user = screen.getByText('User').closest('[data-shd-chat-bubble]')
    expect(assistant?.getAttribute('data-shd-chat-bubble')).toBe('assistant')
    expect(user?.getAttribute('data-shd-chat-bubble')).toBe('user')
    expect(assistant?.className).toContain('shd-chat-bubble-assistant')
    expect(user?.className).toContain('shd-chat-bubble-user')
    expect(assistant?.className).toContain('rounded-bl-sm')
    expect(user?.className).toContain('rounded-br-sm')
    expect(assistant?.className).toContain('text-content-primary')
    expect(user?.className).toContain('text-content-primary')
    expect(assistant?.querySelector('.shd-chat-bubble-content')).toBeDefined()
  })

  it('marks streaming assistant messages as an active material state', () => {
    render(<ChatBubble align="left" streaming timestamp="10:42">Streaming</ChatBubble>)
    const bubble = screen.getByText('Streaming').closest('[data-shd-chat-bubble]')
    expect(bubble?.getAttribute('data-shd-state')).toBe('running')
    expect(bubble?.querySelector('.shd-chat-bubble-meta')).toBeDefined()
    expect(screen.getByLabelText('Streaming')).toBeDefined()
  })

  it('keeps streaming assistant messages on the assistant material palette', () => {
    render(<><ChatBubble align="left">Complete</ChatBubble><ChatBubble align="left" streaming>Streaming</ChatBubble></>)
    const complete = screen.getByText('Complete').closest('[data-shd-chat-bubble]')
    const streaming = screen.getByText('Streaming').closest('[data-shd-chat-bubble]')
    expect(complete?.className).toContain('shd-chat-bubble-assistant')
    expect(streaming?.className).toContain('shd-chat-bubble-assistant')
    expect(streaming?.className).not.toContain('shd-chat-bubble-user')
  })
})
