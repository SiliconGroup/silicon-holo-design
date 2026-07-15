import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CodeBlock } from './CodeBlock'

describe('CodeBlock', () => {
  const writeText = vi.fn()

  beforeEach(() => {
    writeText.mockReset()
    writeText.mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  })

  it('provides a stable semantic code surface while preserving native props', () => {
    render(<CodeBlock data-testid="code" className="custom-code">const value = 1</CodeBlock>)
    const code = screen.getByTestId('code')
    expect(code.parentElement?.className).toContain('bg-surface-raised')
    expect(code.parentElement?.className).toContain('border-stroke-subtle')
    expect(code.className).toContain('custom-code')
    expect(screen.getByText('Code').parentElement?.className).toContain('border-stroke-muted')
  })

  it('copies the rendered plain-text code', async () => {
    render(<CodeBlock>const value = 1</CodeBlock>)
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(writeText).toHaveBeenCalledWith('const value = 1')
    expect(await screen.findByRole('button', { name: 'Code copied' })).toBeDefined()
  })
})
