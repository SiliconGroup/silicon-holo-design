import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ArtifactSource } from '@/types'
import { HoloFileTabs, HoloFileView, HoloStudio, createExplorerPanel, createGitPanel, inferFileKind } from './index'
import type { HoloCodeRendererProps, HoloFileTab, HoloGitFileChange, HoloStudioFile, HoloStudioPanel, HoloTreeNode } from './types'

/**
 * 端到端集成：验证「宿主 + 组件族」的完整闭环，与 examples/studio 的编排一致。
 * 覆盖 07-showcase-and-examples.md 第 2.5 节验收剧本的可自动化部分。
 */

const files: Record<string, string> = {
  'README.md': '# demo\n',
  'src/index.ts': 'export const a = 1\n',
  'src/app.ts': 'export const b = 2\n',
}
const directories = new Set(['src'])

function childrenOf(path: string) {
  const prefix = path === '' ? '' : `${path}/`
  const depth = path === '' ? 1 : path.split('/').length + 1
  const seen = new Set<string>()
  for (const candidate of [...directories, ...Object.keys(files)]) {
    if (!candidate.startsWith(prefix) || candidate === path) continue
    const segments = candidate.split('/')
    if (segments.length < depth) continue
    seen.add(segments.slice(0, depth).join('/'))
  }
  return [...seen]
}

const readDir = vi.fn(async (path: string): Promise<HoloTreeNode[]> =>
  childrenOf(path).map(child => ({
    id: child,
    label: child.split('/').pop() ?? child,
    kind: directories.has(child) ? 'branch' : 'leaf',
    ...(path === '' ? {} : { parentId: path }),
    ...(directories.has(child) ? { expandable: true } : {}),
  })))

const readFile = vi.fn(async (path: string): Promise<ArtifactSource> => ({ kind: 'text', value: files[path] }))
const writeFile = vi.fn(async (_path: string, _content: string) => {})

function TestEditor({ value, onChange, onSaveIntent }: HoloCodeRendererProps) {
  return (
    <div>
      <textarea aria-label="editor" value={value} onChange={event => onChange?.(event.target.value)} />
      <button type="button" onClick={() => onSaveIntent?.()}>save</button>
    </div>
  )
}

function Host() {
  const [nodes, setNodes] = useState<HoloTreeNode[]>([])
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [loadedIds, setLoadedIds] = useState<string[]>([])
  const [open, setOpen] = useState<{ id: string; content: string; dirty: boolean }[]>([])
  const [activeId, setActiveId] = useState<string | undefined>(undefined)
  const [staged, setStaged] = useState<string[]>([])
  const [dirtyPaths, setDirtyPaths] = useState<string[]>([])
  const [commitMessage, setCommitMessage] = useState('')
  const [commits, setCommits] = useState(0)
  const [editable, setEditable] = useState(false)

  useEffect(() => { readDir('').then(setNodes) }, [])

  const openFile = useCallback(async (path: string) => {
    const source = await readFile(path)
    setOpen(previous => previous.some(file => file.id === path)
      ? previous
      : [...previous, { id: path, content: source.kind === 'text' ? source.value : '', dirty: false }])
    setActiveId(path)
  }, [])

  const changes: HoloGitFileChange[] = useMemo(() => {
    const paths = [...new Set([...staged, ...dirtyPaths])].sort()
    return paths.map(path => ({
      path,
      ...(staged.includes(path) ? { indexState: 'modified' as const } : {}),
      ...(dirtyPaths.includes(path) ? { worktreeState: 'modified' as const } : {}),
    }))
  }, [dirtyPaths, staged])

  const activeOpen = open.find(file => file.id === activeId)
  const activeFile: HoloStudioFile | null = activeOpen
    ? {
        id: activeOpen.id,
        fileName: activeOpen.id.split('/').pop() ?? activeOpen.id,
        kind: inferFileKind({ fileName: activeOpen.id }),
        source: { kind: 'text', value: activeOpen.content },
        dirty: activeOpen.dirty,
      }
    : null

  const tabs: HoloFileTab[] = open.map(file => ({ id: file.id, label: file.id.split('/').pop() ?? file.id, dirty: file.dirty }))

  const panels: HoloStudioPanel[] = [
    createExplorerPanel({
      title: 'Explorer',
      tree: {
        nodes,
        expandedIds,
        onExpandedChange: setExpandedIds,
        loadChildren: node => readDir(node.id),
        loadedIds,
        onLoadedIdsChange: setLoadedIds,
        onChildrenLoaded: (parent, children) => setNodes(previous => [...previous.filter(node => node.parentId !== parent.id), ...children]),
        onActivate: node => { if (node.kind === 'leaf') void openFile(node.id) },
      },
    }),
    createGitPanel({
      title: 'Source Control',
      git: {
        repo: { branch: 'main', upstream: 'origin/main' },
        changes,
        commitMessage,
        onCommitMessageChange: setCommitMessage,
        onStage: paths => { setStaged(previous => [...new Set([...previous, ...paths])]); setDirtyPaths(previous => previous.filter(path => !paths.includes(path))) },
        onUnstage: paths => { setStaged(previous => previous.filter(path => !paths.includes(path))); setDirtyPaths(previous => [...new Set([...previous, ...paths])]) },
        onCommit: () => { setStaged([]); setCommits(count => count + 1); setCommitMessage('') },
      },
    }),
  ]

  return (
    <div style={{ height: 600 }}>
      <button type="button" onClick={() => setEditable(current => !current)}>toggle editable</button>
      <span data-testid="commits">{commits}</span>
      <span data-testid="staged">{staged.join(',')}</span>
      <HoloStudio
        panels={panels}
        header={tabs.length > 0 ? <HoloFileTabs tabs={tabs} activeId={activeId} onActiveChange={setActiveId} onClose={id => setOpen(previous => previous.filter(file => file.id !== id))} /> : undefined}
      >
        <HoloFileView
          file={activeFile}
          codeRenderer={editable ? TestEditor : undefined}
          onChange={(file, value) => {
            setOpen(previous => previous.map(candidate => candidate.id === file.id ? { ...candidate, content: value, dirty: true } : candidate))
          }}
          onSaveIntent={async file => {
            const current = open.find(candidate => candidate.id === file.id)
            await writeFile(file.id, current?.content ?? '')
            setOpen(previous => previous.map(candidate => candidate.id === file.id ? { ...candidate, dirty: false } : candidate))
            setDirtyPaths(previous => [...new Set([...previous, file.id])])
          }}
        />
      </HoloStudio>
    </div>
  )
}

const treeRow = (name: string) => screen.getByRole('treeitem', { name: new RegExp(`^${name.replace('.', '\\.')}`) })
const gitGroup = (label: string) => screen.getByRole('group', { name: new RegExp(`^${label}`) })

describe('studio host integration', () => {
  it('walks the full browse → open → edit → save → stage → commit loop', async () => {
    render(<Host />)

    // 1. 宿主读根目录，树渲染出根节点
    await waitFor(() => expect(treeRow('src')).toBeDefined())
    expect(treeRow('README.md')).toBeDefined()

    // 2. 展开目录触发惰性加载，子节点由宿主合并进来
    fireEvent.click(treeRow('src'))
    await waitFor(() => expect(treeRow('index.ts')).toBeDefined())
    expect(readDir).toHaveBeenCalledWith('src')

    // 3. 双击打开文件：只读代码视图 + 新标签
    fireEvent.doubleClick(treeRow('index.ts'))
    await waitFor(() => expect(screen.getByRole('region', { name: 'Code' })).toBeDefined())
    expect(screen.getByRole('tab', { name: 'index.ts' })).toBeDefined()

    // 4. 打开 Markdown：分派到 Artifact 渲染器，不再是代码视图
    fireEvent.doubleClick(treeRow('README.md'))
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Code' })).toBeNull())
    expect(screen.getByRole('tab', { name: 'README.md' })).toBeDefined()

    // 5. 切回代码文件并打开可编辑开关
    fireEvent.click(screen.getByRole('tab', { name: 'index.ts' }))
    fireEvent.click(screen.getByRole('button', { name: 'toggle editable' }))
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'editor' })).toBeDefined())

    // 6. 编辑 → 标签出现 dirty 指示
    fireEvent.change(screen.getByRole('textbox', { name: 'editor' }), { target: { value: 'export const a = 2\n' } })
    await waitFor(() => expect(screen.getAllByTitle('Unsaved changes').length).toBe(1))

    // 7. 保存由宿主执行；组件只上报意图
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'save' })) })
    expect(writeFile).toHaveBeenCalledWith('src/index.ts', 'export const a = 2\n')
    await waitFor(() => expect(screen.queryAllByTitle('Unsaved changes').length).toBe(0))

    // 8. 切到 Git 面板，改动出现在 Changes
    fireEvent.click(screen.getByRole('tab', { name: /Source Control/ }))
    await waitFor(() => expect(gitGroup('Changes')).toBeDefined())
    expect(gitGroup('Changes').textContent).toContain('index.ts')

    // 9. 暂存后移动到 Staged Changes
    fireEvent.click(within(gitGroup('Changes')).getByRole('button', { name: 'Stage all' }))
    await waitFor(() => expect(gitGroup('Staged Changes').textContent).toContain('index.ts'))
    expect(screen.queryByRole('group', { name: /^Changes/ })).toBeNull()
    expect(screen.getByTestId('staged').textContent).toBe('src/index.ts')

    // 10. 再改一次同一文件 → 同时出现在两个分组（git 语义的关键验证）
    fireEvent.click(screen.getByRole('tab', { name: 'Explorer' }))
    fireEvent.click(screen.getByRole('tab', { name: 'index.ts' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'editor' }), { target: { value: 'export const a = 3\n' } })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'save' })) })
    fireEvent.click(screen.getByRole('tab', { name: /Source Control/ }))
    await waitFor(() => expect(gitGroup('Changes').textContent).toContain('index.ts'))
    expect(gitGroup('Staged Changes').textContent).toContain('index.ts')

    // 11. 填写信息并提交
    fireEvent.change(screen.getByRole('textbox', { name: 'Commit message' }), { target: { value: 'feat: integrate studio' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Commit' }).hasAttribute('disabled')).toBe(false))
    fireEvent.click(screen.getByRole('button', { name: 'Commit' }))
    await waitFor(() => expect(screen.getByTestId('commits').textContent).toBe('1'))
    expect(screen.getByTestId('staged').textContent).toBe('')

    // 12. 点击已激活图标折叠侧栏，再点展开；分隔条随之消失与恢复
    fireEvent.click(screen.getByRole('tab', { name: /Source Control/ }))
    await waitFor(() => expect(screen.queryByRole('separator')).toBeNull())
    fireEvent.click(screen.getByRole('tab', { name: /Source Control/ }))
    await waitFor(() => expect(screen.getByRole('separator')).toBeDefined())

    // 13. 键盘调整侧栏宽度并被 clamp 在声明范围内
    const separator = screen.getByRole('separator')
    fireEvent.keyDown(separator, { key: 'Home' })
    expect(separator.getAttribute('aria-valuenow')).toBe('180')
    fireEvent.keyDown(separator, { key: 'End' })
    expect(separator.getAttribute('aria-valuenow')).toBe('520')
  })
})
