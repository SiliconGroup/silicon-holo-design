# Architecture

The studio components are **fully controlled**. The host owns every piece of state and supplies
already-parsed data.

```bash
host (examples/studio)                 library (silicon-holo-design/studio)
──────────────────────                 ───────────────────────────────────
manifest.json  ──▶ readDir  ──nodes──▶ HoloTree
HTTP GET       ──▶ readFile ──source─▶ HoloFileView
in-memory git  ──▶ derive   ──changes▶ HoloGitPanel
```

## Boundaries

| Concern | Owner |
|---------|-------|
| Reading directories and files | Host |
| Rendering, navigation, keyboard, ARIA | Library |
| Computing git status | Host |
| Grouping and presenting git status | Library |
| Writing files | Host |

> `onSaveIntent` only forwards the Cmd/Ctrl+S intent. Nothing is persisted by the library.

## Why a flat tree

Nodes are a flat array of `id` + `parentId`:

- appending lazily loaded children is O(1)
- refreshing one node's git status does not require walking a nested structure
- virtual scrolling needs a flattened list anyway

## Keyboard

| Key | Action |
|-----|--------|
| `↑` `↓` | Move between rows |
| `→` `←` | Expand / collapse |
| `Enter` | Open the focused file |
| `F2` | Rename inline |
| `Cmd/Ctrl+S` | Report a save intent |
