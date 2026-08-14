import type { ArtifactSource } from '@/types'
import type { HoloTreeNode } from '@/components/studio'

/**
 * Host adapter: a manifest driven reader over **real** files.
 *
 * Everything under `assets/studio/` is a real file served over HTTP. `manifest.json` describes the
 * directory structure and file sizes, which is what a desktop host gets from `read_dir` + `stat`.
 * The component library never touches a filesystem: readDir / readFile / writeFile all live here.
 *
 * Downstream, replace these three functions with your own IPC calls (Tauri command, gRPC, Worker).
 */

export interface ManifestEntry {
  path: string
  kind: 'file' | 'directory'
  /** Overrides the default URL so existing payloads in the repository can be reused. */
  url?: string
  bytes?: number
}

interface Manifest {
  name: string
  root: string
  unreadable: string[]
  entries: ManifestEntry[]
}

export interface VirtualFs {
  /** Reads direct children only, like a real read_dir. */
  readDir(path: string): Promise<HoloTreeNode[]>
  /** Edited files come from memory; otherwise the component fetches the URL itself. */
  readFile(path: string): Promise<ArtifactSource>
  writeFile(path: string, content: string): Promise<void>
  /** Committed content for the diff view. Untouched files are fetched once. */
  committedText(path: string): Promise<string>
  entry(path: string): ManifestEntry | undefined
  ready(): Promise<void>
}

const MANIFEST_URL = '/studio/manifest.json'
/** A deliberate read latency so the loading state is observable, like a real IPC round trip. */
const LATENCY_MS = 180

function delay(ms = LATENCY_MS) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

function urlOf(manifest: Manifest, entry: ManifestEntry) {
  return entry.url ?? `${manifest.root}/${entry.path}`
}

function childrenOf(entries: ManifestEntry[], path: string) {
  const depth = path === '' ? 1 : path.split('/').length + 1
  const prefix = path === '' ? '' : `${path}/`
  return entries.filter(entry => {
    if (!entry.path.startsWith(prefix) || entry.path === path) return false
    return entry.path.split('/').length === depth
  })
}

export function createVirtualFs(): VirtualFs {
  const edits = new Map<string, string>()
  const committed = new Map<string, string>()
  let manifest: Manifest | null = null
  let loading: Promise<Manifest> | null = null

  const load = () => {
    if (manifest) return Promise.resolve(manifest)
    if (!loading) {
      loading = fetch(MANIFEST_URL).then(response => {
        if (!response.ok) throw new Error(`Unable to load project manifest (${response.status})`)
        return response.json() as Promise<Manifest>
      }).then(value => {
        manifest = value
        return value
      })
    }
    return loading
  }

  const fetchText = async (path: string) => {
    const current = await load()
    const entry = current.entries.find(candidate => candidate.path === path)
    if (!entry) throw new Error(`ENOENT: no such file '${path}'`)
    const response = await fetch(urlOf(current, entry))
    if (!response.ok) throw new Error(`Unable to read '${path}' (${response.status})`)
    return response.text()
  }

  return {
    async ready() {
      await load()
    },

    entry(path) {
      return manifest?.entries.find(candidate => candidate.path === path)
    },

    async readDir(path) {
      const current = await load()
      await delay()
      if (current.unreadable.includes(path)) {
        throw new Error(`EACCES: permission denied, scandir '${path}'`)
      }
      return childrenOf(current.entries, path)
        .sort((a, b) => {
          const directoryFirst = Number(b.kind === 'directory') - Number(a.kind === 'directory')
          return directoryFirst !== 0 ? directoryFirst : a.path.localeCompare(b.path)
        })
        .map<HoloTreeNode>(entry => ({
          id: entry.path,
          label: entry.path.split('/').pop() ?? entry.path,
          kind: entry.kind === 'directory' ? 'branch' : 'leaf',
          ...(path === '' ? {} : { parentId: path }),
          ...(entry.kind === 'directory' ? { expandable: true } : {}),
          meta: entry,
        }))
    },

    async readFile(path) {
      const current = await load()
      const entry = current.entries.find(candidate => candidate.path === path)
      if (!entry) throw new Error(`ENOENT: no such file '${path}'`)
      await delay(80)
      const edited = edits.get(path)
      if (edited !== undefined) return { kind: 'text', value: edited }
      // Hand back a URL for untouched files: the component fetches it, exercising the async branch.
      return { kind: 'url', url: urlOf(current, entry) }
    },

    async writeFile(path, content) {
      if (!committed.has(path)) {
        // Remember the server copy before the first write so the diff has a baseline.
        committed.set(path, await fetchText(path).catch(() => ''))
      }
      edits.set(path, content)
      await delay(120)
    },

    async committedText(path) {
      const stored = committed.get(path)
      if (stored !== undefined) return stored
      const text = await fetchText(path)
      committed.set(path, text)
      return text
    },
  }
}
