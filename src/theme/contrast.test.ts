import { describe, expect, it } from 'vitest'
import { defaultSemanticTokens } from './tokens'

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  return [0, 2, 4].map(index => Number.parseInt(value.slice(index, index + 2), 16)) as [number, number, number]
}

function parseColor(value: string): { rgb: [number, number, number]; alpha: number } {
  if (value.startsWith('#')) return { rgb: hexToRgb(value), alpha: 1 }
  const channels = value.match(/[\d.]+/g)?.map(Number) ?? []
  return { rgb: channels.slice(0, 3) as [number, number, number], alpha: channels[3] ?? 1 }
}

function composite(foreground: [number, number, number], alpha: number, background: [number, number, number]): [number, number, number] {
  return foreground.map((channel, index) => Math.round(channel * alpha + background[index] * (1 - alpha))) as [number, number, number]
}

function luminance([red, green, blue]: [number, number, number]): number {
  const convert = (channel: number) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * convert(red) + 0.7152 * convert(green) + 0.0722 * convert(blue)
}

function contrast(first: [number, number, number], second: [number, number, number]): number {
  const firstLuminance = luminance(first)
  const secondLuminance = luminance(second)
  return (Math.max(firstLuminance, secondLuminance) + 0.05) / (Math.min(firstLuminance, secondLuminance) + 0.05)
}

describe('default contrast roles', () => {
  const surfaceBase = parseColor(defaultSemanticTokens.colors['surface-base']).rgb

  it('keeps body text above WCAG AA', () => {
    const secondary = parseColor(defaultSemanticTokens.colors['content-secondary'])
    expect(contrast(composite(secondary.rgb, secondary.alpha, surfaceBase), surfaceBase)).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps identity, status, and focus indicators above 3:1', () => {
    for (const role of ['stroke-accent', 'stroke-success', 'stroke-warning', 'stroke-error', 'focus-ring'] as const) {
      const color = parseColor(defaultSemanticTokens.colors[role])
      expect(contrast(composite(color.rgb, color.alpha, surfaceBase), surfaceBase), role).toBeGreaterThanOrEqual(3)
    }
  })
})
