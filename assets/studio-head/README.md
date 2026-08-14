# HEAD baselines

These are the committed (`HEAD`) versions of the files that `assets/studio/` reports as changed, so
the studio example can show a **real** diff for its seeded git state instead of diffing a file
against itself.

| Path | Why it differs |
|------|----------------|
| `src/styles/theme.css` | Modified in the working tree but not staged |
| `src/lib/format.ts` | Staged: `formatBytes` was added |

`assets/studio/manifest.json` maps each path to its baseline through the `head` field. Files without
an entry are unchanged, so their diff is legitimately empty. Untracked files have no `HEAD` version
at all, which is why the example diffs them against an empty document.
