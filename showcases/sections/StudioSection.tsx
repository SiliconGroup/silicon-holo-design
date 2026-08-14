import { useMemo, useRef, useState, type ReactNode } from 'react'
import { ComponentDemo } from '../ComponentDemo'
import { HoloButton } from '@/components/general/button'
import { HoloSwitch } from '@/components/data-entry/switch'
import { HoloTag } from '@/components/data-display/tag'
import { useToast } from '@/components/feedback/toast'
import { ThemeProvider } from '@/theme'
import { useLocale } from '@/locale'
import {
  HoloActivityBar,
  HoloCodeView,
  HoloFileTabs,
  HoloFileView,
  HoloGitPanel,
  HoloSplitPane,
  HoloStudio,
  HoloTree,
  createExplorerPanel,
  createGitPanel,
  type HoloFileTab,
  type HoloStudioFile,
  type HoloStudioPanel,
  type HoloTreeNode,
} from '@/components/studio'
import { HoloCodeEditor, HoloDiffView } from '@/components/studio/editor'
import {
  closeTab,
  flattenTree,
  openTab,
  pinTab,
  type HoloFileTabsState,
  type HoloGitFileChange,
  type HoloGitRepoState,
  type HoloNestedTreeNode,
} from '@/components/studio'

/* --------------------------------------------------------------- demo data */

/**
 * The tree mirrors `assets/studio/`, the same project the studio example serves over HTTP.
 * Tree and git state are inlined here because they describe **component state**, while the
 * file payloads below are referenced by URL from `assets/`, matching the artifact demos.
 */
const projectTree: HoloNestedTreeNode[] = [
  {
    id: 'src', label: 'src', kind: 'branch',
    children: [
      {
        id: 'src/lib', label: 'lib', kind: 'branch',
        children: [
          { id: 'src/lib/format.ts', label: 'format.ts', kind: 'leaf', status: 'added' },
          { id: 'src/lib/parse.rs', label: 'parse.rs', kind: 'leaf' },
          { id: 'src/lib/report.py', label: 'report.py', kind: 'leaf' },
        ],
      },
      { id: 'src/styles', label: 'styles', kind: 'branch', children: [{ id: 'src/styles/theme.css', label: 'theme.css', kind: 'leaf', status: 'modified' }] },
      { id: 'src/features', label: 'features', kind: 'branch', expandable: true },
      { id: 'src/app.ts', label: 'app.ts', kind: 'leaf', badge: 2 },
      { id: 'src/config.json', label: 'config.json', kind: 'leaf' },
      { id: 'src/index.ts', label: 'index.ts', kind: 'leaf' },
      { id: 'src/legacy.ts', label: 'legacy.ts', kind: 'leaf', status: 'deleted' },
      { id: 'src/conflict.ts', label: 'conflict.ts', kind: 'leaf', status: 'conflicted' },
    ],
  },
  {
    id: 'docs', label: 'docs', kind: 'branch',
    children: [
      { id: 'docs/architecture.md', label: 'architecture.md', kind: 'leaf', status: 'renamed' },
      { id: 'docs/telemetry.md', label: 'telemetry.md', kind: 'leaf' },
    ],
  },
  { id: 'assets', label: 'assets', kind: 'branch', children: [{ id: 'assets/logo.svg', label: 'logo.svg', kind: 'leaf' }] },
  { id: 'data', label: 'data', kind: 'branch', children: [{ id: 'data/telemetry.ndjson', label: 'telemetry.ndjson', kind: 'leaf', status: 'untracked' }] },
  { id: 'build', label: 'build', kind: 'branch', children: [{ id: 'build/bundle.wasm', label: 'bundle.wasm', kind: 'leaf', status: 'ignored' }] },
  { id: 'protected', label: 'protected', kind: 'branch', expandable: true, disabled: true },
  { id: 'README.md', label: 'README.md', kind: 'leaf' },
  { id: 'package.json', label: 'package.json', kind: 'leaf' },
]

const projectNodes = flattenTree(projectTree)

const lazyRoots: HoloTreeNode[] = [
  { id: 'packages', label: 'packages', kind: 'branch', expandable: true },
  { id: 'unreadable', label: 'unreadable', kind: 'branch', expandable: true },
]

const lazyChildrenOf = (id: string): HoloTreeNode[] => [
  { id: `${id}/index.ts`, label: 'index.ts', kind: 'leaf', parentId: id },
  { id: `${id}/nested`, label: 'nested', kind: 'branch', parentId: id, expandable: true },
  { id: `${id}/readme.md`, label: 'readme.md', kind: 'leaf', parentId: id },
]

const buildLargeTree = (count: number): HoloTreeNode[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `row-${index}`,
    label: `module-${String(index).padStart(5, '0')}.ts`,
    kind: 'leaf' as const,
  }))

/** Short inline samples: HoloCodeView, HoloCodeEditor and HoloDiffView all take a plain string. */
const samples = {
  typescript: `import { useMemo, useState } from 'react'

/**
 * Compute the visible rows.
 * This block comment spans several lines on purpose: it verifies that
 * per-line syntax highlighting keeps every span balanced.
 */
export function useVisibleRows(rows: string[], expanded: Set<string>) {
  const [cursor, setCursor] = useState(0)
  const visible = useMemo(() => rows.filter(row => expanded.has(row)), [rows, expanded])
  return { visible, cursor, setCursor }
}
`,
  json: `{
  "name": "orbital-console",
  "exports": { "./studio": "./dist/components/studio/index.js" },
  "peerDependenciesMeta": { "@codemirror/state": { "optional": true } }
}
`,
  markdown: `# Studio

A lightweight project reader.

- Fully controlled
- No filesystem assumptions
- No VCS implementation

> The git panel is modelled on git: \`index\` and \`worktree\` states coexist.
`,
  python: `from dataclasses import dataclass


@dataclass
class TreeNode:
    """A flat tree node."""

    id: str
    label: str
    parent_id: str | None = None
`,
  rust: `use std::collections::HashMap;

/// A flat tree node.
pub struct TreeNode {
    pub id: String,
    pub parent_id: Option<String>,
}

pub fn depth(node: &TreeNode, index: &HashMap<String, TreeNode>) -> usize {
    match &node.parent_id {
        None => 0,
        Some(parent) => index.get(parent).map_or(0, |p| depth(p, index) + 1),
    }
}
`,
}

/** Long enough on purpose so the diff overflows the frame and the host scrollbar shows. */
const diffSample = {
  before: `export function resolveCommitAvailability(input) {
  if (input.commitMessage.trim().length === 0) return false
  return input.changes.some(c => c.indexState)
}

export function groupGitChanges(changes) {
  const staged = []
  const unstaged = []
  for (const change of changes) {
    if (change.indexState) staged.push(change)
    if (change.worktreeState) unstaged.push(change)
  }
  return { staged, unstaged }
}

export function splitChangePath(path) {
  const index = path.lastIndexOf('/')
  return { directory: path.slice(0, index), fileName: path.slice(index + 1) }
}
`,
  after: `export function resolveCommitAvailability(input) {
  if (input.repo.inProgress) return { canCommit: false, reason: 'operation' }
  if (input.commitMessage.trim().length === 0) return { canCommit: false, reason: 'message' }
  const hasStaged = input.changes.some(c => c.indexState && c.indexState !== 'conflicted')
  if (!hasStaged && !input.allowEmptyCommit && !input.amend) return { canCommit: false, reason: 'staged' }
  return { canCommit: !input.busy }
}

export function groupGitChanges(changes) {
  const conflicts = []
  const staged = []
  const unstaged = []
  const untracked = []
  for (const change of changes) {
    if (change.indexState === 'conflicted' || change.worktreeState === 'conflicted') {
      conflicts.push(change)
      continue
    }
    if (change.indexState) staged.push(change)
    if (change.worktreeState === 'untracked') untracked.push(change)
    else if (change.worktreeState) unstaged.push(change)
  }
  return { conflicts, staged, unstaged, untracked }
}

export function splitChangePath(path) {
  const normalized = path.replace(/\\\\/g, '/')
  const index = normalized.lastIndexOf('/')
  return index < 0
    ? { directory: '', fileName: normalized }
    : { directory: normalized.slice(0, index), fileName: normalized.slice(index + 1) }
}
`,
}

const gitRepo: HoloGitRepoState = { branch: 'feature/studio', upstream: 'origin/feature/studio', ahead: 3, behind: 1 }

const gitChanges: HoloGitFileChange[] = [
  { path: 'src/conflict.ts', indexState: 'conflicted', worktreeState: 'modified', conflict: { ours: true, theirs: true } },
  { path: 'src/app.ts', indexState: 'modified', worktreeState: 'modified' },
  { path: 'src/lib/format.ts', indexState: 'added' },
  { path: 'docs/architecture.md', indexState: 'renamed', originalPath: 'docs/design.md' },
  { path: 'src/styles/theme.css', worktreeState: 'modified' },
  { path: 'src/legacy.ts', worktreeState: 'deleted' },
  { path: 'src/lib/typechange', worktreeState: 'typeChanged' },
  { path: 'data/telemetry.ndjson', worktreeState: 'untracked' },
  { path: 'notes.txt', worktreeState: 'untracked' },
]

/**
 * Real files from `assets/studio/`, referenced by URL. This exercises the asynchronous source
 * branch of HoloFileView and reuses the payloads already in the repository, exactly like the
 * artifact preview demos do.
 */
const fileByKind: Record<string, HoloStudioFile> = {
  code: { id: 'src/app.ts', fileName: 'app.ts', source: { kind: 'url', url: '/studio/src/app.ts' } },
  markdown: { id: 'docs/architecture.md', fileName: 'architecture.md', source: { kind: 'url', url: '/studio/docs/architecture.md' } },
  svg: { id: 'assets/logo.svg', fileName: 'logo.svg', source: { kind: 'url', url: '/studio/assets/logo.svg' } },
  image: { id: 'logo.png', fileName: 'logo.png', source: { kind: 'url', url: '/logo.png' } },
  pdf: { id: 'docs/operations.pdf', fileName: 'operations.pdf', source: { kind: 'url', url: '/artifact-preview/complex-document.pdf' } },
  spreadsheet: { id: 'data/workbook.xlsx', fileName: 'workbook.xlsx', source: { kind: 'url', url: '/artifact-preview/complex-workbook.xlsx' } },
  binary: { id: 'build/bundle.wasm', fileName: 'bundle.wasm', source: { kind: 'url', url: '/studio/build/bundle.wasm' } },
}


const Metric = ({ label, value }: { label: string; value: string | number }) => (
  <span className="font-mono text-[11px] text-content-tertiary">{label}: <span className="text-content-accent">{value}</span></span>
)

/**
 * Studio panes fill their parent through `flex-1` + `min-h-0`, so the frame must be a
 * flex container. In a plain block parent `flex-1` is inert, the pane grows to its content
 * height and its internal scroll region never actually scrolls.
 * The frame stays transparent so the Canvas / Base / Raised switcher remains visible.
 */
const Frame = ({ height = 320, children }: { height?: number; children: ReactNode }) => (
  <div className="flex min-h-0 overflow-hidden rounded-md border border-stroke-subtle" style={{ height }}>{children}</div>
)

/* ------------------------------------------------------------------ shell */

function StudioShellDemo() {
  const locale = useLocale()
  const studio = locale.studio
  const [nodes] = useState(projectNodes)
  const [expandedIds, setExpandedIds] = useState<string[]>(['src', 'src/components'])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [commitMessage, setCommitMessage] = useState('feat(studio): add project explorer')
  const [collapsedLog, setCollapsedLog] = useState('-')
  const [withPanels, setWithPanels] = useState(true)

  const panels: HoloStudioPanel[] = useMemo(() => [
    createExplorerPanel({
      title: studio?.explorerTitle,
      tree: { nodes, expandedIds, onExpandedChange: setExpandedIds, selectedIds, onSelectedChange: setSelectedIds },
      actions: <HoloTag size="sm" color="cyan">{nodes.length}</HoloTag>,
    }),
    createGitPanel({
      title: studio?.gitTitle,
      git: { repo: gitRepo, changes: gitChanges, commitMessage, onCommitMessageChange: setCommitMessage, onStage: () => {}, onUnstage: () => {}, onOpenDiff: () => {}, onCommit: () => {}, onRefresh: () => {} },
    }),
    {
      id: 'notes',
      title: 'Notes',
      placement: 'bottom',
      badge: '!',
      icon: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden="true"><path d="M3 2.5h10v11H3zM5.5 6h5M5.5 9h3" /></svg>,
      render: () => <div className="p-3 text-xs text-content-secondary">Any panel can be registered by the host. This descriptor array is the whole extension mechanism &mdash; there is no registry.</div>,
    },
  ], [commitMessage, expandedIds, nodes, selectedIds, studio])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <HoloSwitch checked={withPanels} onChange={setWithPanels} label="Provide panels" />
        <Metric label="side collapsed" value={collapsedLog} />
      </div>
      <Frame height={380}>
        <HoloStudio
          panels={withPanels ? panels : undefined}
          onSideCollapsedChange={next => setCollapsedLog(String(next))}
          header={<HoloFileTabs tabs={[{ id: 'a', label: 'index.ts' }, { id: 'b', label: 'App.tsx', dirty: true }]} activeId="a" />}
          footer={<div className="flex-none border-t border-stroke-muted px-3 py-1 font-mono text-[10px] text-content-tertiary">HoloStudio &middot; footer is supplied by the host</div>}
        >
          <HoloCodeView value={samples.typescript} languageId="typescript" />
        </HoloStudio>
      </Frame>
      <p className="m-0 text-xs text-content-tertiary">Click the active icon to collapse the side panel. Drag the divider to resize it.</p>
    </div>
  )
}

/* ----------------------------------------------------------- activity bar */

function ActivityBarDemo() {
  const [activeId, setActiveId] = useState('explorer')
  const items = [
    { id: 'explorer', title: 'Explorer', icon: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden="true"><path d="M2 3.5h4l1 1h7v8H2z" /></svg> },
    { id: 'git', title: 'Source Control', badge: 9, icon: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden="true"><path d="M4.5 3.5v9M11.5 3.5v3a2 2 0 0 1-2 2h-5" /></svg> },
    { id: 'search', title: 'Search', badge: '99+', icon: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden="true"><circle cx="7" cy="7" r="4" /><path d="M10 10l3.5 3.5" /></svg> },
    { id: 'locked', title: 'Disabled panel', disabled: true, icon: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden="true"><rect x="4" y="7" width="8" height="6" /><path d="M6 7V5a2 2 0 0 1 4 0v2" /></svg> },
    { id: 'settings', title: 'Settings', placement: 'bottom' as const, icon: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden="true"><circle cx="8" cy="8" r="2.5" /><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2" /></svg> },
  ]
  return (
    <div className="flex flex-col gap-2">
      <Metric label="active" value={activeId} />
      <Frame height={240}>
        <HoloActivityBar items={items} activeId={activeId} onActiveChange={setActiveId} />
        <p className="m-0 p-3 text-xs text-content-secondary">Arrow Up / Arrow Down / Home / End move focus between icons. Enter or Space activates. Badges sit at the bottom-right corner and are exposed through the accessible name.</p>
      </Frame>
    </div>
  )
}

/* ------------------------------------------------------------------- tree */

function TreeDemo() {
  const [expandedIds, setExpandedIds] = useState<string[]>(['src', 'src/components', 'src/lib', 'assets'])
  const [selectedIds, setSelectedIds] = useState<string[]>(['src/index.ts'])
  const [nodes, setNodes] = useState(projectNodes)
  const [multiple, setMultiple] = useState(false)
  const [activated, setActivated] = useState('-')
  const [empty, setEmpty] = useState(false)
  const withError = useMemo(() => nodes.map(node => node.id === 'dist' ? { ...node, error: 'EACCES: permission denied' } : node), [nodes])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <HoloSwitch checked={multiple} onChange={setMultiple} label="multiple (Ctrl/Cmd and Shift)" />
        <HoloSwitch checked={empty} onChange={setEmpty} label="empty state" />
        <Metric label="activated" value={activated} />
        <Metric label="selected" value={selectedIds.length} />
      </div>
      <Frame height={340}>
        <HoloTree
          nodes={empty ? [] : withError}
          emptyContent={<div className="p-4 text-xs text-content-tertiary">Custom empty state: nothing to show right now.</div>}
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          selectedIds={selectedIds}
          onSelectedChange={setSelectedIds}
          multiple={multiple}
          onActivate={node => setActivated(node.id)}
          onRename={(node, label) => setNodes(previous => previous.map(item => item.id === node.id ? { ...item, label } : item))}
        />
      </Frame>
      <p className="m-0 text-xs text-content-tertiary">
        F2 renames inline, typing jumps by first letter, Arrow Left / Arrow Right collapse and expand.
        Status colours change the text only, never the background. The <code className="text-content-accent">dist</code> node
        carries an <code className="text-content-accent">error</code>, so it renders a <code className="text-content-accent">role=alert</code> hint and stays retryable.
      </p>
    </div>
  )
}

function TreeLazyDemo() {
  const [nodes, setNodes] = useState<HoloTreeNode[]>(lazyRoots)
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [loadedIds, setLoadedIds] = useState<string[]>([])
  const [requests, setRequests] = useState(0)
  const [lastError, setLastError] = useState('-')

  const loadChildren = (node: HoloTreeNode) => {
    setRequests(count => count + 1)
    return new Promise<HoloTreeNode[]>((resolve, reject) => {
      setTimeout(() => {
        if (node.id.startsWith('unreadable')) reject(new Error('EACCES: permission denied'))
        else resolve(lazyChildrenOf(node.id))
      }, 800)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <Metric label="loadChildren calls" value={requests} />
        <Metric label="loaded" value={loadedIds.length} />
        <Metric label="last error" value={lastError} />
        <HoloButton size="sm" variant="ghost" onClick={() => { setNodes(lazyRoots); setExpandedIds([]); setLoadedIds([]); setRequests(0); setLastError('-') }}>Reset</HoloButton>
      </div>
      <Frame height={260}>
        <HoloTree
          nodes={nodes}
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          loadChildren={loadChildren}
          loadedIds={loadedIds}
          onLoadedIdsChange={setLoadedIds}
          onChildrenLoaded={(parent, children) => setNodes(previous => [...previous.filter(node => node.parentId !== parent.id), ...children])}
          onLoadError={(parent, error) => {
            setLastError(error instanceof Error ? error.message : String(error))
            setNodes(previous => previous.map(node => node.id === parent.id ? { ...node, error: 'EACCES' } : node))
          }}
        />
      </Frame>
      <p className="m-0 text-xs text-content-tertiary">
        Expand, collapse and expand <code className="text-content-accent">packages</code> three times in a row: the call
        count stays at 1 because in-flight requests are de-duplicated. <code className="text-content-accent">unreadable</code>
        always fails, never enters loadedIds, and can therefore be retried.
      </p>
    </div>
  )
}

function TreeVirtualDemo() {
  const nodes = useMemo(() => buildLargeTree(5000), [])
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [rendered, setRendered] = useState(0)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <Metric label="total nodes" value={nodes.length} />
        <Metric label="rows in the DOM" value={rendered} />
        <HoloButton size="sm" variant="ghost" onClick={() => setRendered(containerRef.current?.querySelectorAll('[data-shd-tree-row]').length ?? 0)}>Measure</HoloButton>
      </div>
      <Frame height={280}>
        <div ref={containerRef} className="flex min-h-0 flex-1">
          <HoloTree nodes={nodes} expandedIds={expandedIds} onExpandedChange={setExpandedIds} ariaLabel="Large tree" />
        </div>
      </Frame>
      <p className="m-0 text-xs text-content-tertiary">Scroll, then press Measure: the row count stays at viewport scale and is independent of the total node count.</p>
    </div>
  )
}

/* -------------------------------------------------------------- file tabs */

const initialTabs: HoloFileTab[] = [
  { id: 'a', label: 'index.ts', title: 'src/index.ts' },
  { id: 'b', label: 'App.tsx', title: 'src/components/App.tsx', dirty: true },
  { id: 'c', label: 'parse.rs', title: 'src/lib/parse.rs' },
  { id: 'd', label: 'a-very-long-file-name-that-overflows.tsx', title: 'src/a-very-long-file-name-that-overflows.tsx' },
  { id: 'e', label: 'theme.css', title: 'src/theme.css' },
  { id: 'f', label: 'README.md', title: 'README.md', dirty: true },
]

const openable = ['index.ts', 'app.ts', 'config.json', 'theme.css', 'README.md']

function FileTabsDemo() {
  const [state, setState] = useState<HoloFileTabsState>({ tabs: initialTabs, activeId: 'b' })
  const [closable, setClosable] = useState(true)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {openable.map(name => (
          <HoloButton
            key={name}
            size="sm"
            variant="ghost"
            onClick={() => setState(previous => openTab(previous, { id: name, label: name, title: `src/${name}` }))}
          >
            open {name}
          </HoloButton>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <HoloSwitch checked={closable} onChange={setClosable} label="closable" />
        <Metric label="active" value={state.activeId ?? '-'} />
        <Metric label="preview tab" value={state.tabs.filter(tab => tab.preview === true).map(tab => tab.id).join(',') || 'none'} />
        <HoloButton size="sm" variant="ghost" onClick={() => setState({ tabs: initialTabs, activeId: 'b' })}>Reset</HoloButton>
      </div>
      {/* Width is capped so the documented overflow scrolling is actually reachable in the demo. */}
      <div className="max-w-md rounded-md border border-stroke-subtle">
        <HoloFileTabs
          tabs={state.tabs}
          activeId={state.activeId}
          onActiveChange={id => setState(previous => ({ ...previous, activeId: id }))}
          onPin={id => setState(previous => pinTab(previous, id))}
          closable={closable}
          onClose={id => setState(previous => closeTab(previous, id))}
        />
      </div>
      <p className="m-0 text-xs text-content-tertiary">
        The buttons above stand in for single clicks in the explorer, driven by the exported
        <code className="text-content-accent"> openTab</code> / <code className="text-content-accent">pinTab</code> /
        <code className="text-content-accent"> closeTab</code> state machine. There is at most one preview tab (italic):
        opening another file replaces it in place. Double click a preview tab to keep it open, after which the next
        single click opens a fresh preview tab. The dirty dot turns into a close button on hover, middle click closes,
        and the strip scrolls when the tabs overflow.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------- code view */

const languageOptions = [
  { id: 'typescript', label: 'TypeScript', value: samples.typescript },
  { id: 'json', label: 'JSON', value: samples.json },
  { id: 'markdown', label: 'Markdown', value: samples.markdown },
  { id: 'python', label: 'Python', value: samples.python },
  { id: 'rust', label: 'Rust', value: samples.rust },
]

function CodeViewDemo() {
  const [languageIndex, setLanguageIndex] = useState(0)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [wrap, setWrap] = useState(false)
  const [limited, setLimited] = useState(false)
  const [exceeded, setExceeded] = useState('-')
  const active = languageOptions[languageIndex]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {languageOptions.map((option, index) => (
          <HoloButton key={option.id} size="sm" variant={index === languageIndex ? 'primary' : 'ghost'} onClick={() => setLanguageIndex(index)}>{option.label}</HoloButton>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <HoloSwitch checked={showLineNumbers} onChange={setShowLineNumbers} label="line numbers" />
        <HoloSwitch checked={wrap} onChange={setWrap} label="soft wrap" />
        <HoloSwitch checked={limited} onChange={setLimited} label="maxRenderBytes = 128 B" />
        <Metric label="onExceedLimit" value={exceeded} />
      </div>
      <Frame height={300}>
        <HoloCodeView
          value={active.value}
          languageId={active.id}
          showLineNumbers={showLineNumbers}
          wrap={wrap}
          highlightLines={[2, 3]}
          revealLine={2}
          maxRenderBytes={limited ? 128 : undefined}
          onExceedLimit={bytes => setExceeded(`${bytes} B`)}
        />
      </Frame>
      <p className="m-0 text-xs text-content-tertiary">
        Reuses the highlight.js instance and the <code className="text-content-accent">.hljs-*</code> palette already bundled
        with the library, so it adds 0 KB. Lines 2 and 3 are emphasised through highlightLines. Turn the byte limit on to see
        the oversized placeholder.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------ code editor */

function CodeEditorDemo() {
  const toast = useToast()
  const [value, setValue] = useState(samples.typescript)
  const [readOnly, setReadOnly] = useState(false)
  const [languageIndex, setLanguageIndex] = useState(0)
  const [saves, setSaves] = useState(0)
  const active = languageOptions[languageIndex]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {languageOptions.map((option, index) => (
          <HoloButton key={option.id} size="sm" variant={index === languageIndex ? 'primary' : 'ghost'} onClick={() => { setLanguageIndex(index); setValue(option.value) }}>{option.label}</HoloButton>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <HoloSwitch checked={readOnly} onChange={setReadOnly} label="readOnly" />
        <Metric label="controlled length" value={value.length} />
        <Metric label="onSaveIntent calls" value={saves} />
      </div>
      <Frame height={300}>
        <HoloCodeEditor
          value={value}
          languageId={active.id}
          readOnly={readOnly}
          onChange={setValue}
          onSaveIntent={() => { setSaves(count => count + 1); toast.info('onSaveIntent: the component only reports intent, the host writes the file') }}
          highlightLines={[3]}
        />
      </Frame>
      <p className="m-0 text-xs text-content-tertiary">
        Type in the editor and the controlled length updates immediately while the caret stays put. Cmd/Ctrl+S only reports
        the intent &mdash; the component never persists anything.
      </p>
    </div>
  )
}

function DiffViewDemo() {
  const [layout, setLayout] = useState<'split' | 'unified'>('split')
  const [mode, setMode] = useState<'change' | 'same' | 'insert' | 'remove'>('change')
  const pair = {
    change: diffSample,
    same: { before: diffSample.after, after: diffSample.after },
    insert: { before: '', after: diffSample.after },
    remove: { before: diffSample.before, after: '' },
  }[mode]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {(['split', 'unified'] as const).map(option => (
          <HoloButton key={option} size="sm" variant={layout === option ? 'primary' : 'ghost'} onClick={() => setLayout(option)}>{option}</HoloButton>
        ))}
        <span className="mx-2 h-4 w-px bg-stroke-muted" />
        {(['change', 'same', 'insert', 'remove'] as const).map(option => (
          <HoloButton key={option} size="sm" variant={mode === option ? 'primary' : 'ghost'} onClick={() => setMode(option)}>{option}</HoloButton>
        ))}
      </div>
      <Frame height={300}>
        <HoloDiffView
          key={`${layout}-${mode}`}
          before={pair.before}
          after={pair.after}
          languageId="javascript"
          layout={layout}
          beforeLabel="HEAD"
          afterLabel="Working tree"
        />
      </Frame>
    </div>
  )
}

/* -------------------------------------------------------------- file view */

const fileOptions = ['code', 'markdown', 'svg', 'image', 'pdf', 'spreadsheet', 'binary']
  .map(id => ({ id, label: id, file: fileByKind[id] }))

function FileViewDemo() {
  const [index, setIndex] = useState(0)
  const [editable, setEditable] = useState(false)
  const [custom, setCustom] = useState(false)
  const [file, setFile] = useState<HoloStudioFile>(fileOptions[0].file)
  const [saves, setSaves] = useState(0)
  const [mode, setMode] = useState<'preview' | 'source'>('preview')

  const pick = (next: number) => {
    setIndex(next)
    setFile(fileOptions[next].file)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {fileOptions.map((option, optionIndex) => (
          <HoloButton key={option.id} size="sm" variant={optionIndex === index ? 'primary' : 'ghost'} onClick={() => pick(optionIndex)}>{option.label}</HoloButton>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <HoloSwitch checked={editable} onChange={setEditable} label="inject HoloCodeEditor" />
        <HoloSwitch checked={custom} onChange={setCustom} label="override code renderer" />
        <Metric label="mode" value={mode} />
        <Metric label="onSaveIntent calls" value={saves} />
      </div>
      <Frame height={300}>
        <HoloFileView
          file={file}
          mode={mode}
          onModeChange={setMode}
          codeRenderer={editable ? HoloCodeEditor : undefined}
          renderers={custom ? { code: current => <p className="p-4 text-xs text-content-accent">A custom renderer took over {current.fileName}</p> } : undefined}
          onChange={(current, value) => setFile({ ...current, source: { kind: 'text', value }, dirty: true })}
          onSaveIntent={() => setSaves(count => count + 1)}
        />
      </Frame>
      <p className="m-0 text-xs text-content-tertiary">
        With the switch off this uses the built-in read-only HoloCodeView, a path that needs <strong className="text-content-secondary">no CodeMirror package at all</strong>.
        Markdown, SVG, image, PDF and spreadsheet files reuse the ArtifactRenderer already shipped with the library, loaded from
        <code className="text-content-accent"> assets/studio/</code> over HTTP.
        Text backed previews (markdown, SVG, HTML) also offer a Preview / Source switch, so they can be edited as source;
        PDF, spreadsheet, image and binary files are preview only.
      </p>
    </div>
  )
}

/* --------------------------------------------------------------- git panel */

function GitPanelDemo() {
  const [commitMessage, setCommitMessage] = useState('fix(git): keep index and worktree states independent')
  const [changes, setChanges] = useState(gitChanges)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [rebasing, setRebasing] = useState(false)
  const [log, setLog] = useState('-')

  const stage = (paths: string[]) => setChanges(previous => previous.map(change => paths.includes(change.path)
    ? { path: change.path, indexState: change.indexState ?? change.worktreeState, originalPath: change.originalPath }
    : change))
  const unstage = (paths: string[]) => setChanges(previous => previous.map(change => paths.includes(change.path)
    ? { path: change.path, worktreeState: change.worktreeState ?? change.indexState, originalPath: change.originalPath }
    : change))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <HoloSwitch checked={busy} onChange={setBusy} label="busy" />
        <HoloSwitch checked={error} onChange={setError} label="error" />
        <HoloSwitch checked={rebasing} onChange={setRebasing} label="inProgress: rebase" />
        <Metric label="last action" value={log} />
        <HoloButton size="sm" variant="ghost" onClick={() => { setChanges(gitChanges); setLog('-') }}>Reset</HoloButton>
      </div>
      <Frame height={420}>
        <HoloGitPanel
          repo={{ ...gitRepo, ...(rebasing ? { inProgress: 'rebase' as const } : {}) }}
          changes={changes}
          commitMessage={commitMessage}
          onCommitMessageChange={setCommitMessage}
          busy={busy}
          error={error ? 'fatal: Unable to create index.lock: File exists.' : undefined}
          onStage={paths => { stage(paths); setLog(`stage ${paths.length}`) }}
          onUnstage={paths => { unstage(paths); setLog(`unstage ${paths.length}`) }}
          onDiscard={paths => { setChanges(previous => previous.filter(change => !paths.includes(change.path))); setLog(`discard ${paths.length}`) }}
          onOpenDiff={(path, side) => setLog(`diff ${path} @ ${side}`)}
          onCommit={options => { setChanges(previous => previous.filter(change => change.worktreeState)); setLog(`commit amend=${options.amend}`) }}
          onRefresh={() => setLog('refresh')}
          onSelectChange={change => setLog(`select ${change.path}`)}
        />
      </Frame>
      <p className="m-0 text-xs text-content-tertiary">
        <code className="text-content-accent">src/components/App.tsx</code> appears in Staged Changes and in Changes at the
        same time. That is correct git semantics, not a defect. Conflicted entries only offer a diff and
        Mark as resolved, which is equivalent to <code className="text-content-accent">git add</code>.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------- split pane */

function SplitPaneDemo() {
  const [horizontal, setHorizontal] = useState(240)
  const [vertical, setVertical] = useState(110)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <Metric label="horizontal size" value={`${horizontal}px`} />
        <Metric label="vertical size" value={`${vertical}px`} />
      </div>
      {/*
        Fill each slot with flex-1 + box-border. The library has no global border-box reset, so
        h-full + p-3 makes the child 24px taller than its slot (the padding is added outside the
        100%), which paints over the divider and looks like the text is misaligned.
      */}
      <Frame height={200}>
        <HoloSplitPane size={horizontal} onSizeChange={setHorizontal} defaultSize={240} minSize={140} maxSize={420} className="flex-1">
          {[
            <div key="a" className="box-border flex-1 bg-surface-raised p-3 text-xs text-content-secondary">First pane, 140-420px</div>,
            <div key="b" className="box-border flex-1 p-3 text-xs text-content-secondary">Second pane. Drag the divider, or use Arrow keys, Shift to accelerate, Home / End for the bounds and Enter to reset.</div>,
          ]}
        </HoloSplitPane>
      </Frame>
      <Frame height={220}>
        <HoloSplitPane direction="vertical" size={vertical} onSizeChange={setVertical} defaultSize={110} minSize={60} maxSize={170} className="flex-1">
          {[
            <div key="a" className="box-border flex-1 bg-surface-raised p-3 text-xs text-content-secondary">Top pane, 60-170px</div>,
            <div key="b" className="box-border flex-1 p-3 text-xs text-content-secondary">Bottom pane. Arrow Up and Arrow Down resize it.</div>,
          ]}
        </HoloSplitPane>
      </Frame>
    </div>
  )
}

/* ---------------------------------------------------------------- theming */

function ThemingDemo() {
  const [warm, setWarm] = useState(false)
  const [expandedIds, setExpandedIds] = useState<string[]>(['src'])
  const theme = warm
    ? { semanticColors: { 'accent-primary': '#ff9a3c', 'surface-inset': '#1a1206', 'surface-selected': 'rgba(255, 154, 60, 0.16)' } }
    : {}

  return (
    <div className="flex flex-col gap-2">
      <HoloSwitch checked={warm} onChange={setWarm} label="override accent-primary and surface-inset" />
      <ThemeProvider theme={theme}>
        <Frame height={300}>
          <div className="flex min-h-0 flex-1">
            <div className="flex w-56 flex-none border-r border-stroke-muted">
              <HoloTree nodes={projectNodes} expandedIds={expandedIds} onExpandedChange={setExpandedIds} selectedIds={['src/index.ts']} onSelectedChange={() => {}} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <HoloFileTabs tabs={[{ id: 'a', label: 'index.ts' }, { id: 'b', label: 'App.tsx' }]} activeId="a" />
              <HoloSplitPane direction="vertical" defaultSize={120} minSize={60} maxSize={200} className="min-h-0 flex-1">
                {[
                  <HoloCodeView key="view" value={samples.rust} languageId="rust" highlightLines={[4]} />,
                  <HoloCodeEditor key="editor" value={samples.json} languageId="json" highlightLines={[2]} />,
                ]}
              </HoloSplitPane>
            </div>
          </div>
        </Frame>
      </ThemeProvider>
      <p className="m-0 text-xs text-content-tertiary">
        The tree selection, the active tab edge, HoloCodeView and the CodeMirror editor all follow the theme at once,
        because the editor theme takes every colour from <code className="text-content-accent">var(--shd-*)</code>.
      </p>
    </div>
  )
}

/* ----------------------------------------------------------------- export */

export default function StudioSection() {
  return (
    <div className="space-y-12">
      <ComponentDemo id="studio-shell" title="HoloStudio" description="Activity bar, collapsible side panel and main area. Panels are extended through a descriptor array, with no registry">
        <StudioShellDemo />
      </ComponentDemo>

      <ComponentDemo id="studio-activity-bar" title="HoloActivityBar" description="Narrow 48px icon rail with bottom placement, numeric and text badges, disabled items and vertical keyboard navigation">
        <ActivityBarDemo />
      </ComponentDemo>

      <ComponentDemo id="studio-tree" title="HoloTree" description="Controlled virtualised tree with flat id and parentId data, eight status colours, single and multiple selection, inline rename and full ARIA tree semantics">
        <TreeDemo />
      </ComponentDemo>

      <ComponentDemo id="studio-tree-lazy" title="HoloTree Lazy Load" description="Lazy loading through loadChildren and loadedIds: loading state, retryable failures and in-flight de-duplication, with no TTL cache">
        <TreeLazyDemo />
      </ComponentDemo>

      <ComponentDemo id="studio-tree-large" title="HoloTree Virtual Scroll" description="5000 nodes rendered through a hand-written window, with no virtual scrolling library">
        <TreeVirtualDemo />
      </ComponentDemo>

      <ComponentDemo id="studio-file-tabs" title="HoloFileTabs" description="File tabs with dirty indicators, close buttons, overflow scrolling, middle-click close and arrow key switching">
        <FileTabsDemo />
      </ComponentDemo>

      <ComponentDemo id="studio-code-view" title="HoloCodeView" description="Read-only highlighted view reusing the bundled highlight.js, with line numbers, soft wrap, line emphasis, scroll-to-line and a byte limit placeholder">
        <CodeViewDemo />
      </ComponentDemo>

      <ComponentDemo id="studio-code-editor" title="HoloCodeEditor" description="Fully controlled CodeMirror 6 wrapper from ./studio/editor. CodeMirror is installed by the application">
        <CodeEditorDemo />
      </ComponentDemo>

      <ComponentDemo id="studio-diff-view" title="HoloDiffView" description="A @codemirror/merge wrapper supporting both split and unified layouts">
        <DiffViewDemo />
      </ComponentDemo>

      <ComponentDemo id="studio-file-view" title="HoloFileView" description="Dispatches by file kind: code goes to the injected renderer, documents reuse the existing Artifact renderers, anything else renders a placeholder">
        <FileViewDemo />
      </ComponentDemo>

      <ComponentDemo id="studio-git-panel" title="HoloGitPanel" description="Modelled on git: independent index and worktree states, conflict-first grouping, rebase in progress, amend and a discard confirmation. The panel holds no git logic">
        <GitPanelDemo />
      </ComponentDemo>

      <ComponentDemo id="studio-split-pane" title="HoloSplitPane" description="Draggable and keyboard-resizable split container with separator semantics and size clamping">
        <SplitPaneDemo />
      </ComponentDemo>

      <ComponentDemo id="studio-theme" title="Studio Theming" description="Verifies that every studio surface, including the CodeMirror internals, follows the semantic token overrides from ThemeProvider">
        <ThemingDemo />
      </ComponentDemo>
    </div>
  )
}
