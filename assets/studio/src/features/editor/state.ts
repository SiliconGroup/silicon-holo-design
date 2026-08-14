export interface EditorState {
  openPaths: string[]
  activePath: string | null
  dirtyPaths: Set<string>
}

export function createEditorState(): EditorState {
  return { openPaths: [], activePath: null, dirtyPaths: new Set() }
}

export function openPath(state: EditorState, path: string): EditorState {
  const openPaths = state.openPaths.includes(path) ? state.openPaths : [...state.openPaths, path]
  return { ...state, openPaths, activePath: path }
}

export function closePath(state: EditorState, path: string): EditorState {
  const openPaths = state.openPaths.filter(candidate => candidate !== path)
  const activePath = state.activePath === path ? openPaths[openPaths.length - 1] ?? null : state.activePath
  return { ...state, openPaths, activePath }
}
