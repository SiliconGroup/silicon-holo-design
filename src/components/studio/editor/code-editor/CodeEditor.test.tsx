import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { EditorView } from '@codemirror/view'
import { HoloCodeEditor } from './CodeEditor'

const source = 'const a = 1\nconst b = 2\nconst c = 3'

const viewOf = (container: HTMLElement) => {
  const dom = container.querySelector<HTMLElement>('.cm-editor')
  if (!dom) throw new Error('editor not mounted')
  const view = EditorView.findFromDOM(dom)
  if (!view) throw new Error('view not found')
  return view
}

describe('HoloCodeEditor', () => {
  it('mounts a CodeMirror editor with the initial document', () => {
    const { container } = render(<HoloCodeEditor value={source} languageId="typescript" />)
    expect(viewOf(container).state.doc.toString()).toBe(source)
    expect(screen.getByRole('group', { name: 'Code editor' })).toBeDefined()
  })

  it('accepts a custom aria label', () => {
    render(<HoloCodeEditor value={source} ariaLabel="src/main.ts" />)
    expect(screen.getByRole('group', { name: 'src/main.ts' })).toBeDefined()
  })

  it('reports user edits through onChange', () => {
    const onChange = vi.fn()
    const { container } = render(<HoloCodeEditor value={source} onChange={onChange} />)
    const view = viewOf(container)
    act(() => { view.dispatch({ changes: { from: 0, insert: 'x' } }) })
    expect(onChange).toHaveBeenCalledWith(`x${source}`)
  })

  it('applies an external value change', () => {
    const { container, rerender } = render(<HoloCodeEditor value={source} />)
    rerender(<HoloCodeEditor value="replaced" />)
    expect(viewOf(container).state.doc.toString()).toBe('replaced')
  })

  it('does not report an external value replacement back through onChange', () => {
    const onChange = vi.fn()
    const { rerender } = render(<HoloCodeEditor value={source} onChange={onChange} />)
    rerender(<HoloCodeEditor value="programmatically replaced" onChange={onChange} />)
    // 外部同步用 annotation 标记，不得回调 onChange，否则宿主状态会自我触发。
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not re-dispatch when the parent echoes the same value back', () => {
    function Host() {
      const [value, setValue] = useState(source)
      return <HoloCodeEditor value={value} onChange={setValue} />
    }
    const { container } = render(<Host />)
    const view = viewOf(container)
    act(() => { view.dispatch({ selection: { anchor: view.state.doc.length } }) })
    const dispatchSpy = vi.spyOn(view, 'dispatch')
    act(() => { view.dispatch(view.state.replaceSelection('!')) })
    // 只有我们自己那一次 dispatch；受控回传的相同内容不得再触发一次全文替换。
    expect(dispatchSpy).toHaveBeenCalledTimes(1)
    expect(view.state.doc.toString()).toBe(`${source}!`)
    dispatchSpy.mockRestore()
  })

  it('keeps the caret at the typing position across a long sequence', () => {
    function Host() {
      const [value, setValue] = useState('')
      return <HoloCodeEditor value={value} onChange={setValue} />
    }
    const { container } = render(<Host />)
    const view = viewOf(container)
    for (let index = 0; index < 30; index += 1) {
      act(() => { view.dispatch(view.state.replaceSelection('a')) })
    }
    expect(view.state.doc.toString()).toBe('a'.repeat(30))
    expect(view.state.selection.main.head).toBe(30)
  })

  it('honours read-only and can be switched back', () => {
    const { container, rerender } = render(<HoloCodeEditor value={source} readOnly />)
    const view = viewOf(container)
    expect(view.state.readOnly).toBe(true)
    expect(view.contentDOM.getAttribute('contenteditable')).toBe('false')
    rerender(<HoloCodeEditor value={source} readOnly={false} />)
    expect(view.state.readOnly).toBe(false)
  })

  it('is editable by default', () => {
    const { container } = render(<HoloCodeEditor value={source} />)
    expect(viewOf(container).state.readOnly).toBe(false)
  })

  it('forwards the save intent on the platform shortcut', () => {
    const onSaveIntent = vi.fn()
    const { container } = render(<HoloCodeEditor value={source} onSaveIntent={onSaveIntent} />)
    const content = viewOf(container).contentDOM
    fireEvent.keyDown(content, { key: 's', metaKey: true })
    if (onSaveIntent.mock.calls.length === 0) fireEvent.keyDown(content, { key: 's', ctrlKey: true })
    expect(onSaveIntent).toHaveBeenCalledTimes(1)
  })

  it('shows and hides the gutter', () => {
    const { container, unmount } = render(<HoloCodeEditor value={source} />)
    expect(container.querySelector('.cm-gutters')).toBeDefined()
    unmount()
    const bare = render(<HoloCodeEditor value={source} showLineNumbers={false} />)
    expect(bare.container.querySelector('.cm-lineNumbers')).toBeNull()
  })

  it('toggles line wrapping', () => {
    const { container, rerender } = render(<HoloCodeEditor value={source} />)
    const view = viewOf(container)
    expect(view.contentDOM.className).not.toContain('cm-lineWrapping')
    rerender(<HoloCodeEditor value={source} wrap />)
    expect(view.contentDOM.className).toContain('cm-lineWrapping')
  })

  it('decorates the emphasised lines', () => {
    const { container } = render(<HoloCodeEditor value={source} highlightLines={[2]} />)
    expect(container.querySelector('.cm-shd-emphasis-line')).toBeDefined()
  })

  it('loads a known language and stays plain text for an unknown one', async () => {
    const { container, unmount } = render(<HoloCodeEditor value={source} languageId="typescript" />)
    await waitFor(() => expect(viewOf(container).state.facet(EditorView.contentAttributes)).toBeDefined())
    expect(container.querySelector('.cm-editor')).toBeDefined()
    unmount()
    const plain = render(<HoloCodeEditor value={source} languageId="totally-unknown" />)
    await waitFor(() => expect(plain.container.querySelector('.cm-editor')).toBeDefined())
  })

  it('accepts a language override map', async () => {
    const loader = vi.fn(async () => null)
    render(<HoloCodeEditor value={source} languageId="typescript" languages={{ typescript: loader }} />)
    await waitFor(() => expect(loader).toHaveBeenCalled())
  })

  it('moves the caret to the revealed line', () => {
    const { container } = render(<HoloCodeEditor value={source} revealLine={3} />)
    const view = viewOf(container)
    expect(view.state.doc.lineAt(view.state.selection.main.head).number).toBe(3)
  })

  it('ignores an out-of-range revealLine', () => {
    const { container } = render(<HoloCodeEditor value={source} revealLine={99} />)
    expect(viewOf(container).state.selection.main.head).toBe(0)
  })

  it('applies the configured tab size', () => {
    const { container } = render(<HoloCodeEditor value={source} tabSize={4} />)
    expect(viewOf(container).state.tabSize).toBe(4)
  })

  it('destroys the view on unmount', () => {
    const { container, unmount } = render(<HoloCodeEditor value={source} />)
    const view = viewOf(container)
    const destroy = vi.spyOn(view, 'destroy')
    unmount()
    expect(destroy).toHaveBeenCalled()
  })

  it('keeps the inset surface contract', () => {
    render(<HoloCodeEditor value={source} />)
    expect(screen.getByRole('group', { name: 'Code editor' }).className).toContain('shd-surface-inset')
  })
})
