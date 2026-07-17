import { describe, expect, it } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { ChatMessageList } from './ChatMessageList'

function setScrollMetrics(element: HTMLElement, values: { scrollHeight: number; clientHeight: number; scrollTop: number }) {
  Object.defineProperties(element, {
    scrollHeight: { configurable: true, value: values.scrollHeight },
    clientHeight: { configurable: true, value: values.clientHeight },
  })
  element.scrollTop = values.scrollTop
}

describe('ChatMessageList', () => {
  it('uses the shared restrained scrollbar contract', () => {
    const { container } = render(<ChatMessageList><div>One</div></ChatMessageList>)
    expect(container.firstElementChild?.className).toContain('shd-scrollbar')
    expect((container.firstElementChild as HTMLElement).dataset.shdMessageScroll).toBe('true')
  })

  it('follows updates while near the bottom', () => {
    const { container, rerender } = render(<ChatMessageList scrollDeps={[1]}><div>One</div></ChatMessageList>)
    const list = container.firstElementChild as HTMLElement
    setScrollMetrics(list, { scrollHeight: 500, clientHeight: 200, scrollTop: 300 })
    fireEvent.scroll(list)

    rerender(<ChatMessageList scrollDeps={[2]}><div>Two</div></ChatMessageList>)
    expect(list.scrollTop).toBe(500)
  })

  it('does not pull users away from message history', () => {
    const { container, rerender } = render(<ChatMessageList scrollDeps={[1]}><div>One</div></ChatMessageList>)
    const list = container.firstElementChild as HTMLElement
    setScrollMetrics(list, { scrollHeight: 500, clientHeight: 200, scrollTop: 100 })
    fireEvent.scroll(list)

    rerender(<ChatMessageList scrollDeps={[1, 2]}><div>Two</div></ChatMessageList>)
    expect(list.scrollTop).toBe(100)
  })
})
