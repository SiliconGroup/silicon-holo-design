import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatBubble } from './ChatBubble'

describe('ChatBubble', () => {
  it('uses directional local edges instead of a full card border', () => {
    render(<><ChatBubble align="left">Assistant</ChatBubble><ChatBubble align="right">User</ChatBubble></>)
    const assistant = screen.getByText('Assistant').closest('[data-shd-chat-bubble]')
    const user = screen.getByText('User').closest('[data-shd-chat-bubble]')
    expect(assistant?.className).toContain('border-l-2')
    expect(assistant?.className.split(/\s+/)).not.toContain('border')
    expect(user?.className).toContain('border-r-2')
    expect(user?.className.split(/\s+/)).not.toContain('border')
  })
})
