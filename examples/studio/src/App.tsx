import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  HoloButton,
  HoloSpace,
  HoloSwitch,
  HoloTag,
  LocaleProvider,
  ToastProvider,
  enUS,
  formatMessage,
  useToast,
  zhCN,
  type Locale,
} from '@/index'
import {
  HoloDiffView,
  HoloCodeEditor,
} from '@/components/studio/editor'
import {
  HoloFileTabs,
  HoloFileView,
  HoloStudio,
  closeTab,
  createExplorerPanel,
  createGitPanel,
  inferFileKind,
  openTab,
  pinTab,
  type HoloFileTab,
  type HoloFileTabsState,
  type HoloStudioFile,
  type HoloStudioPanel,
  type HoloTreeNode,
} from '@/components/studio'
import { createVirtualFs, type ManifestEntry } from './virtual-fs'
import { messagesFor } from './i18n'
import {
  commit,
  createVirtualGitState,
  deriveChanges,
  deriveTreeStatus,
  discard,
  markDirty,
  stage,
  unstage,
  virtualRepo,
} from './virtual-git'

const fs = createVirtualFs()

/** Lowered to 32 KB for this demo so the 48 KB telemetry file shows the oversized placeholder. */
const MAX_RENDER_BYTES = 32 * 1024

/** Drafts and dirty flags live next to the tab state, keyed by path. */
interface FileDraft {
  draft?: string
  dirty: boolean
}

interface DiffTarget {
  path: string
  before: string
  after: string
}

/**
 * Merge lazily loaded children into the host's own state.
 *
 * ── Copy this straight into your app ──
 * The tree is controlled, so the host owns `nodes` and must merge whatever loadChildren returns.
 * Drop the previous children of that parent first (so a refetch cannot duplicate them), then
 * append the new ones. The data is a flat id + parentId list, so this is an O(n) array operation
 * with no recursion.
 */
function mergeChildren(previous: HoloTreeNode[], parentId: string, children: HoloTreeNode[]): HoloTreeNode[] {
  const withoutOld = previous.filter(node => node.parentId !== parentId)
  const cleared = withoutOld.map(node => (node.id === parentId && node.error !== undefined ? { ...node, error: undefined } : node))
  return [...cleared, ...children]
}

function StudioExample({ locale, onLocaleChange }: { locale: Locale; onLocaleChange(next: Locale): void }) {
  const toast = useToast()
  const messages = messagesFor(locale)

  const [nodes, setNodes] = useState<HoloTreeNode[]>([])
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [loadedIds, setLoadedIds] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  /*
   * Tab state uses the library's preview-tab state machine: single click opens a preview tab that
   * the next single click replaces in place, double click pins it. openTab / pinTab / closeTab are
   * pure, so the host just stores whatever they return.
   */
  const [tabState, setTabState] = useState<HoloFileTabsState>({ tabs: [] })
  const [drafts, setDrafts] = useState<Record<string, FileDraft>>({})
  const [diffTarget, setDiffTarget] = useState<DiffTarget | null>(null)
  const [git, setGit] = useState(createVirtualGitState)
  const [commitMessage, setCommitMessage] = useState('')
  const [editable, setEditable] = useState(false)
  const [busy, setBusy] = useState(false)
  const draftsRef = useRef(new Map<string, string>())
  const toastRef = useRef(toast)
  toastRef.current = toast

  /*
   * Root directory: the host reads it exactly once on mount.
   * `toast` is deliberately kept out of the dependency list and reached through a ref: an effect
   * that re-runs would refetch the root and wipe every lazily loaded child and error state.
   */
  useEffect(() => {
    let cancelled = false
    fs.readDir('').then(roots => {
      if (cancelled) return
      setNodes(roots)
      setLoadedIds([''])
    }).catch(error => toastRef.current.error(String(error)))
    return () => { cancelled = true }
  }, [])

  const loadChildren = useCallback((node: HoloTreeNode) => fs.readDir(node.id), [])

  const openPath = useCallback((path: string, options: { pinned?: boolean } = {}) => {
    setDiffTarget(null)
    setTabState(previous => openTab(previous, {
      id: path,
      // Tabs show the file name and keep the full path in the title, as editors conventionally do
      label: path.split('/').pop() ?? path,
      title: path,
    }, options))
  }, [])

  /* Saving is performed by the host. The component only reports onSaveIntent and never persists. */
  const saveFile = useCallback(async (file: HoloStudioFile) => {
    const draft = draftsRef.current.get(file.id)
    if (draft === undefined) return
    await fs.writeFile(file.id, draft)
    setDrafts(previous => ({ ...previous, [file.id]: { draft, dirty: false } }))
    setGit(previous => markDirty(previous, file.id))
    toast.success(formatMessage(messages.saved, { path: file.id }))
  }, [messages, toast])

  const changes = useMemo(() => deriveChanges(git), [git])

  const decoratedNodes = useMemo(() => nodes.map(node => {
    const status = deriveTreeStatus(git, node.id)
    return status === undefined ? node : { ...node, status }
  }), [git, nodes])

  const activePath = tabState.activeId
  const activeEntry = activePath ? fs.entry(activePath) : undefined
  const activeDraft = activePath ? drafts[activePath] : undefined

  const activeFile: HoloStudioFile | null = useMemo(() => {
    if (!activePath) return null
    const entry = fs.entry(activePath) as ManifestEntry | undefined
    return {
      id: activePath,
      fileName: activePath.split('/').pop() ?? activePath,
      kind: inferFileKind({ fileName: activePath }),
      // Edited files use the in-memory draft; otherwise hand over a URL for the component to fetch
      source: activeDraft?.draft !== undefined
        ? { kind: 'text', value: activeDraft.draft }
        : { kind: 'url', url: entry?.url ?? `/studio/${activePath}` },
      dirty: activeDraft?.dirty === true,
      byteSize: entry?.bytes,
    }
  }, [activeDraft, activePath])

  const tabs: HoloFileTab[] = tabState.tabs.map(tab => ({ ...tab, dirty: drafts[tab.id]?.dirty === true }))

  const panels: HoloStudioPanel[] = useMemo(() => [
    createExplorerPanel({
      title: locale.studio?.explorerTitle,
      actions: <HoloTag size="sm" color="cyan">{nodes.length}</HoloTag>,
      tree: {
        nodes: decoratedNodes,
        expandedIds,
        onExpandedChange: setExpandedIds,
        selectedIds,
        onSelectedChange: setSelectedIds,
        // Single click opens the file: the de-facto standard in editors
        activateOn: 'click',
        loadChildren,
        loadedIds,
        onLoadedIdsChange: setLoadedIds,
        onChildrenLoaded: (parent, children) => setNodes(previous => mergeChildren(previous, parent.id, children)),
        onLoadError: (parent, error) => {
          const message = error instanceof Error ? error.message : String(error)
          setNodes(previous => previous.map(node => node.id === parent.id ? { ...node, error: message } : node))
          toast.error(message)
        },
        // Single click previews, double click pins: the de-facto editor standard
        onActivate: node => { if (node.kind === 'leaf') openPath(node.id) },
        onActivatePinned: node => { if (node.kind === 'leaf') openPath(node.id, { pinned: true }) },
      },
    }),
    createGitPanel({
      title: locale.studio?.gitTitle,
      git: {
        repo: virtualRepo,
        changes,
        commitMessage,
        onCommitMessageChange: setCommitMessage,
        busy,
        onStage: paths => setGit(previous => stage(previous, paths)),
        onUnstage: paths => setGit(previous => unstage(previous, paths)),
        onDiscard: paths => setGit(previous => discard(previous, paths)),
        onSelectChange: change => openPath(change.path),
        onOpenDiff: async path => {
          try {
            const before = await fs.committedText(path)
            const after = draftsRef.current.get(path) ?? before
            setDiffTarget({ path, before, after })
            setTabState(previous => ({ ...previous, activeId: undefined }))
          } catch (error) {
            toast.error(String(error))
          }
        },
        onCommit: async options => {
          setBusy(true)
          await new Promise(resolve => setTimeout(resolve, 240))
          setGit(previous => commit(previous, commitMessage, options.amend))
          // commitMessage is controlled: clearing it is the host's decision, never the component's
          setCommitMessage('')
          setBusy(false)
          toast.success(options.amend ? messages.amended : messages.committed)
        },
        onRefresh: () => toast.info(messages.refreshed),
      },
    }),
    {
      id: 'history',
      title: messages.history,
      placement: 'bottom',
      badge: git.commits.length > 0 ? git.commits.length : undefined,
      icon: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden="true"><circle cx="8" cy="8" r="5.5" /><path d="M8 5v3.2l2 1.2" /></svg>,
      render: () => (
        <div className="shd-scrollbar min-h-0 flex-1 overflow-auto p-2">
          {git.commits.length === 0
            ? <p className="m-0 text-xs text-content-tertiary">{messages.noCommits}</p>
            : <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {git.commits.map((entry, index) => (
                  <li key={index} className="rounded-sm border border-stroke-muted bg-surface-inset p-2">
                    <p className="m-0 text-xs text-content-primary">{entry.message}</p>
                    <p className="m-0 font-mono text-[10px] text-content-tertiary">
                      {entry.at} · {entry.paths.length} {messages.files}{entry.amend ? ' · amend' : ''}
                    </p>
                  </li>
                ))}
              </ul>}
        </div>
      ),
    },
  ], [busy, changes, commitMessage, decoratedNodes, expandedIds, git.commits, loadChildren, loadedIds, locale, messages, nodes.length, openPath, selectedIds, toast])

  return (
    <div className="flex h-screen flex-col bg-surface-canvas">
      <header className="flex flex-none flex-wrap items-center gap-3 border-b border-stroke-subtle bg-surface-base px-4 py-2">
        <img src="/logo.svg" alt="logo" className="h-6" />
        <div className="min-w-0">
          <h1 className="m-0 text-sm font-semibold text-content-primary">{messages.title}</h1>
          <p className="m-0 text-[11px] text-content-tertiary">{messages.subtitle}</p>
        </div>
        <div className="ml-auto">
          <HoloSpace size="sm" wrap>
            <HoloSwitch checked={editable} onChange={setEditable} label={messages.editable} />
            <HoloButton size="sm" variant="ghost" onClick={() => { setTabState({ tabs: [] }); setDrafts({}); draftsRef.current.clear(); setDiffTarget(null) }}>{messages.closeAll}</HoloButton>
            <HoloButton size="sm" variant={locale === enUS ? 'primary' : 'ghost'} onClick={() => onLocaleChange(enUS)}>EN</HoloButton>
            <HoloButton size="sm" variant={locale === zhCN ? 'primary' : 'ghost'} onClick={() => onLocaleChange(zhCN)}>中文</HoloButton>
          </HoloSpace>
        </div>
      </header>

      <p className="m-0 flex-none border-b border-stroke-muted bg-surface-inset px-4 py-1.5 text-[11px] text-content-tertiary">
        {messages.previewHint} {editable ? messages.editorHint : messages.readOnlyHint}
      </p>

      <div className="min-h-0 flex-1">
        <HoloStudio
          panels={panels}
          header={tabs.length > 0
            ? <HoloFileTabs
                tabs={tabs}
                activeId={activePath}
                onActiveChange={path => { setTabState(previous => ({ ...previous, activeId: path })); setDiffTarget(null) }}
                // Double clicking a preview tab pins it
                onPin={path => setTabState(previous => pinTab(previous, path))}
                onClose={path => {
                  draftsRef.current.delete(path)
                  setDrafts(previous => { const next = { ...previous }; delete next[path]; return next })
                  setTabState(previous => closeTab(previous, path))
                }}
              />
            : undefined}
          footer={
            <div className="flex flex-none flex-wrap items-center gap-4 border-t border-stroke-muted px-3 py-1 font-mono text-[10px] text-content-tertiary">
              <span>{virtualRepo.branch}</span>
              {activeEntry?.bytes !== undefined && <span>{activePath} · {activeEntry.bytes} B</span>}
              <span>{changes.length} {messages.changes}</span>
              <span>{git.staged.size} {messages.staged}</span>
              <span>{Object.values(drafts).filter(draft => draft.dirty).length} {messages.unsaved}</span>
            </div>
          }
        >
          {diffTarget
            ? <HoloDiffView
                key={diffTarget.path}
                before={diffTarget.before}
                after={diffTarget.after}
                languageId="typescript"
                beforeLabel={`${messages.diffBefore} · ${diffTarget.path}`}
                afterLabel={`${messages.diffAfter} · ${diffTarget.path}`}
              />
            : <HoloFileView
                file={activeFile}
                codeRenderer={editable ? HoloCodeEditor : undefined}
                maxRenderBytes={MAX_RENDER_BYTES}
                onChange={(file, value) => {
                  draftsRef.current.set(file.id, value)
                  setDrafts(previous => ({ ...previous, [file.id]: { draft: value, dirty: true } }))
                  // Editing a preview tab pins it, exactly like VS Code
                  setTabState(previous => pinTab(previous, file.id))
                }}
                onSaveIntent={file => void saveFile(file)}
                onExceedLimit={(file, bytes) => toast.info(formatMessage(messages.tooLarge, { path: file.id, size: `${Math.round(bytes / 1024)} KB` }))}
              />}
        </HoloStudio>
      </div>
    </div>
  )
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(enUS)
  return (
    <LocaleProvider locale={locale}>
      <ToastProvider>
        <StudioExample locale={locale} onLocaleChange={setLocale} />
      </ToastProvider>
    </LocaleProvider>
  )
}
