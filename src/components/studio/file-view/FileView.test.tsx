import { describe, expect, it, vi } from 'vitest'
import { useEffect, useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HoloFileView } from './FileView'
import type { HoloCodeRendererProps, HoloStudioFile } from '../types'

const codeFile: HoloStudioFile = {
  id: 'src/main.ts',
  fileName: 'main.ts',
  source: { kind: 'text', value: 'const a = 1' },
}

function EditableRenderer({ value, readOnly, onChange, onSaveIntent, languageId }: HoloCodeRendererProps) {
  return (
    <div>
      <span data-testid="renderer-language">{languageId}</span>
      <span data-testid="renderer-readonly">{String(readOnly)}</span>
      <textarea aria-label="editor" value={value} readOnly={readOnly} onChange={event => onChange?.(event.target.value)} />
      <button type="button" onClick={() => onSaveIntent?.()}>save</button>
    </div>
  )
}

describe('HoloFileView', () => {
  it('renders the built-in empty state and custom empty content', () => {
    const { unmount } = render(<HoloFileView file={null} />)
    expect(screen.getByText('No file open')).toBeDefined()
    unmount()
    render(<HoloFileView file={null} emptyContent={<p>Pick a file</p>} />)
    expect(screen.getByText('Pick a file')).toBeDefined()
  })

  it('falls back to the read-only code view when no renderer is injected', async () => {
    render(<HoloFileView file={codeFile} />)
    await waitFor(() => expect(screen.getByRole('region', { name: 'Code' })).toBeDefined())
    expect(screen.queryByRole('textbox', { name: 'editor' })).toBeNull()
  })

  it('uses the injected code renderer and passes the inferred language', async () => {
    render(<HoloFileView file={codeFile} codeRenderer={EditableRenderer} />)
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'editor' })).toBeDefined())
    expect(screen.getByTestId('renderer-language').textContent).toBe('typescript')
  })

  it('honours an explicit languageId over the inferred one', async () => {
    render(<HoloFileView file={{ ...codeFile, languageId: 'rust' }} codeRenderer={EditableRenderer} />)
    await waitFor(() => expect(screen.getByTestId('renderer-language').textContent).toBe('rust'))
  })

  it('forwards edits and save intent with the originating file', async () => {
    const onChange = vi.fn()
    const onSaveIntent = vi.fn()
    render(<HoloFileView file={codeFile} codeRenderer={EditableRenderer} onChange={onChange} onSaveIntent={onSaveIntent} />)
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'editor' })).toBeDefined())
    fireEvent.change(screen.getByRole('textbox', { name: 'editor' }), { target: { value: 'const a = 2' } })
    expect(onChange).toHaveBeenCalledWith(codeFile, 'const a = 2')
    fireEvent.click(screen.getByRole('button', { name: 'save' }))
    expect(onSaveIntent).toHaveBeenCalledWith(codeFile)
  })

  it('forces read-only through to the injected renderer', async () => {
    render(<HoloFileView file={{ ...codeFile, readOnly: true }} codeRenderer={EditableRenderer} onChange={() => {}} />)
    await waitFor(() => expect(screen.getByTestId('renderer-readonly').textContent).toBe('true'))
  })

  it('dispatches svg and image files to the artifact renderer', async () => {
    const svg = { id: 'logo', fileName: 'logo.svg', source: { kind: 'text' as const, value: '<svg/>' } }
    const { unmount } = render(<HoloFileView file={svg} />)
    await waitFor(() => expect(screen.queryByText('No file open')).toBeNull())
    expect(screen.queryByRole('region', { name: 'Code' })).toBeNull()
    unmount()

    render(<HoloFileView file={{ id: 'p', fileName: 'photo.png', source: { kind: 'url', url: 'https://example.test/p.png' } }} />)
    await waitFor(() => expect(document.querySelector('img')).toBeDefined())
  })

  it('resolves text for content-backed kinds so a url source is not blank', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>'
    const fetchMock = vi.fn(async () => new Response(svg, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const { container } = render(<HoloFileView file={{ id: 'a.svg', fileName: 'a.svg', source: { kind: 'url', url: 'https://example.test/a.svg' } }} />)
    // SvgRenderer 读的是 artifact.content，不取回文本就会静默渲染空白。
    await waitFor(() => expect(container.querySelector('svg[viewBox="0 0 8 8"]')).not.toBeNull())
    expect(fetchMock).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('offers a preview / source toggle for markdown and defaults to preview', async () => {
    const md = { id: 'a.md', fileName: 'a.md', source: { kind: 'text' as const, value: '# hello\n' } }
    render(<HoloFileView file={md} />)
    const group = screen.getByRole('group', { name: 'View mode' })
    expect(group).toBeDefined()
    expect(screen.getByRole('button', { name: 'Preview' }).getAttribute('aria-pressed')).toBe('true')
    await waitFor(() => expect(document.querySelector('.shd-markdown-content')).not.toBeNull())

    fireEvent.click(screen.getByRole('button', { name: 'Source' }))
    expect(screen.getByRole('region', { name: 'Code' })).toBeDefined()
    expect(document.querySelector('.shd-markdown-content')).toBeNull()
  })

  it('resets to the default mode when a different file is opened', () => {
    const md = { id: 'a.md', fileName: 'a.md', source: { kind: 'text' as const, value: '# a\n' } }
    const other = { id: 'b.md', fileName: 'b.md', source: { kind: 'text' as const, value: '# b\n' } }
    const { rerender } = render(<HoloFileView file={md} />)
    fireEvent.click(screen.getByRole('button', { name: 'Source' }))
    expect(screen.getByRole('button', { name: 'Source' }).getAttribute('aria-pressed')).toBe('true')
    rerender(<HoloFileView file={other} />)
    // 每个文件都从 defaultMode 开始，否则看过一次源码后所有 markdown 都停在源码
    expect(screen.getByRole('button', { name: 'Preview' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('lets the host control the mode', () => {
    const onModeChange = vi.fn()
    const md = { id: 'a.md', fileName: 'a.md', source: { kind: 'text' as const, value: '# hello\n' } }
    render(<HoloFileView file={md} mode="source" onModeChange={onModeChange} />)
    expect(screen.getByRole('region', { name: 'Code' })).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))
    expect(onModeChange).toHaveBeenCalledWith('preview')
    // 受控模式下组件不自行改变
    expect(screen.getByRole('region', { name: 'Code' })).toBeDefined()
  })

  it('honours defaultMode and can hide the toggle', () => {
    const md = { id: 'a.md', fileName: 'a.md', source: { kind: 'text' as const, value: '# hello\n' } }
    const { unmount } = render(<HoloFileView file={md} defaultMode="source" />)
    expect(screen.getByRole('region', { name: 'Code' })).toBeDefined()
    unmount()
    render(<HoloFileView file={md} showModeToggle={false} />)
    expect(screen.queryByRole('group', { name: 'View mode' })).toBeNull()
  })

  it('edits markdown source through the injected renderer', () => {
    const onChange = vi.fn()
    const md = { id: 'a.md', fileName: 'a.md', source: { kind: 'text' as const, value: '# hello\n' } }
    render(<HoloFileView file={md} defaultMode="source" codeRenderer={EditableRenderer} onChange={onChange} />)
    expect(screen.getByTestId('renderer-language').textContent).toBe('markdown')
    fireEvent.change(screen.getByRole('textbox', { name: 'editor' }), { target: { value: '# edited' } })
    expect(onChange).toHaveBeenCalledWith(md, '# edited')
  })

  it('offers no toggle for code or for binary previews', () => {
    const { unmount } = render(<HoloFileView file={codeFile} />)
    expect(screen.queryByRole('group', { name: 'View mode' })).toBeNull()
    unmount()
    for (const file of [
      { id: 'a.pdf', fileName: 'a.pdf', source: { kind: 'url' as const, url: '/a.pdf' } },
      { id: 'a.xlsx', fileName: 'a.xlsx', source: { kind: 'url' as const, url: '/a.xlsx' } },
      { id: 'a.png', fileName: 'a.png', source: { kind: 'url' as const, url: '/a.png' } },
      { id: 'a.wasm', fileName: 'a.wasm', source: { kind: 'text' as const, value: '' } },
    ]) {
      const view = render(<HoloFileView file={file} />)
      expect(screen.queryByRole('group', { name: 'View mode' }), file.fileName).toBeNull()
      view.unmount()
    }
  })

  it('shows the toggle for svg and switches to its source', async () => {
    const svg = { id: 'a.svg', fileName: 'a.svg', source: { kind: 'text' as const, value: '<svg viewBox="0 0 4 4"></svg>' } }
    render(<HoloFileView file={svg} />)
    expect(screen.getByRole('group', { name: 'View mode' })).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Source' }))
    expect(screen.getByRole('region', { name: 'Code' })).toBeDefined()
  })

  it('renders a placeholder for binary payloads', () => {
    render(<HoloFileView file={{ id: 'b', fileName: 'app.wasm', source: { kind: 'text', value: '' } }} />)
    expect(screen.getByText('This file cannot be previewed')).toBeDefined()
  })

  it('lets a custom renderer override any kind', () => {
    render(
      <HoloFileView
        file={codeFile}
        renderers={{ code: file => <p>custom {file.fileName}</p> }}
        codeRenderer={EditableRenderer}
      />,
    )
    expect(screen.getByText('custom main.ts')).toBeDefined()
    expect(screen.queryByRole('textbox', { name: 'editor' })).toBeNull()
  })

  it('respects an explicit kind over the file extension', () => {
    render(
      <HoloFileView
        file={{ id: 'x', fileName: 'notes.md', kind: 'binary', source: { kind: 'text', value: '# hi' } }}
      />,
    )
    expect(screen.getByText('This file cannot be previewed')).toBeDefined()
  })

  it('reports an overflowing code file with the originating file', async () => {
    const onExceedLimit = vi.fn()
    render(
      <HoloFileView
        file={{ ...codeFile, source: { kind: 'text', value: 'x'.repeat(4096) } }}
        maxRenderBytes={1024}
        onExceedLimit={onExceedLimit}
      />,
    )
    await waitFor(() => expect(onExceedLimit).toHaveBeenCalledWith(expect.objectContaining({ id: 'src/main.ts' }), 4096))
  })

  it('does not remount the code renderer while a text source is edited', async () => {
    const mounts = vi.fn()
    function CountingRenderer({ value, onChange }: HoloCodeRendererProps) {
      useEffect(() => { mounts() }, [])
      return <textarea aria-label="editor" value={value} onChange={event => onChange?.(event.target.value)} />
    }
    function Host() {
      const [value, setValue] = useState('const a = 1')
      return (
        <HoloFileView
          file={{ ...codeFile, source: { kind: 'text', value } }}
          codeRenderer={CountingRenderer}
          onChange={(_file, next) => setValue(next)}
        />
      )
    }
    render(<Host />)
    const editor = screen.getByRole('textbox', { name: 'editor' })
    expect(mounts).toHaveBeenCalledTimes(1)
    fireEvent.change(editor, { target: { value: 'const a = 2' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'editor' }), { target: { value: 'const a = 3' } })
    await waitFor(() => expect((screen.getByRole('textbox', { name: 'editor' }) as HTMLTextAreaElement).value).toBe('const a = 3'))
    // 同步文本来源不得走异步加载分支，否则每次输入都会重建编辑器、丢失光标。
    expect(mounts).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('textbox', { name: 'editor' })).toBe(editor)
  })

  it('shows a loading state only for asynchronous sources', async () => {
    render(<HoloFileView file={{ id: 'r', fileName: 'remote.ts', source: { kind: 'url', url: 'https://example.test/a.ts' } }} />)
    expect(screen.getByText('Loading file…')).toBeDefined()
  })

  it('surfaces a load failure from a url source', async () => {
    const fetchMock = vi.fn(async () => new Response('nope', { status: 500 }))
    vi.stubGlobal('fetch', fetchMock)
    render(<HoloFileView file={{ id: 'r', fileName: 'remote.ts', source: { kind: 'url', url: 'https://example.test/a.ts' } }} />)
    await waitFor(() => expect(screen.getByText(/Unable to load resource/)).toBeDefined())
    vi.unstubAllGlobals()
  })
})
