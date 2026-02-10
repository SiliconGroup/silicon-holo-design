import { describe, it, expect } from 'vitest'
import { defaultTokens } from './tokens'

describe('Theme', () => {
  it('has all required color tokens', () => {
    expect(defaultTokens.colors['holo-cyan']).toBe('#00ffff')
    expect(defaultTokens.colors['scene-void']).toBe('#000a0e')
    expect(defaultTokens.colors['status-success']).toBe('#00ff88')
    expect(defaultTokens.colors['text-primary']).toBe('rgba(255,255,255,0.95)')
  })
})
