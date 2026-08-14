# orbital-console

A small reference project used by the `silicon-holo-design` studio example.

Every file under `assets/studio/` is a **real file served over HTTP**. The example reads it by
path, exactly like a desktop host would read it through IPC — the component library itself never
touches a filesystem.

## Layout

| Path | Purpose |
|------|---------|
| `src/` | Application source, several languages |
| `docs/` | Markdown documents, rendered through the Artifact renderer |
| `assets/` | Images and vector art |
| `data/` | Payloads, including one file large enough to hit the render limit |
| `build/` | Build output, including a binary that cannot be previewed |
| `protected/` | A directory that always fails to read, to exercise the error state |

## Try this

1. Click a file once to open it.
2. Open `docs/architecture.md` for Markdown, `assets/logo.svg` for vector art.
3. Open `data/telemetry.ndjson` to see the oversized-file placeholder.
4. Expand `protected/` to see a failed directory read that stays retryable.
5. Edit any text file, press `Cmd/Ctrl+S`, then look at the Source Control panel.
