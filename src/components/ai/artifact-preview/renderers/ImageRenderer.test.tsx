import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ImageRenderer } from './ImageRenderer'

describe('ImageRenderer', () => {
  it('uses a URL source as the image src', () => {
    /*
     * 回归：历史实现只读 artifact.content，URL 来源会变成 src="" 并显示破图。
     * HoloFileView 的 image 分支正是靠 source 传 URL 的。
     */
    render(<ImageRenderer artifact={{ id: 'i', type: 'image', title: 'logo.png', content: '', source: { kind: 'url', url: '/logo.png' } }} />)
    expect(screen.getByAltText('logo.png').getAttribute('src')).toBe('/logo.png')
  })

  it('keeps the legacy content-as-src behaviour when no source is given', () => {
    render(<ImageRenderer artifact={{ id: 'i', type: 'image', title: 'inline', content: 'data:image/png;base64,AAAA' }} />)
    expect(screen.getByAltText('inline').getAttribute('src')).toBe('data:image/png;base64,AAAA')
  })

  it('falls back to the generic alt text when the artifact has no title', () => {
    render(<ImageRenderer artifact={{ id: 'i', type: 'image', content: '/a.png' }} />)
    expect(screen.getByAltText('Image')).toBeDefined()
  })
})
