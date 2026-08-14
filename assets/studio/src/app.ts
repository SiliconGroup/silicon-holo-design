import type { EditorState } from './features/editor/state'

export interface ConsoleOptions {
  title: string
  editor: EditorState
}

/**
 * Minimal application shell.
 *
 * This block comment spans several lines on purpose: it verifies that the studio code view
 * keeps every highlight span balanced when it splits highlighted HTML into rows.
 */
export function createConsole(options: ConsoleOptions) {
  let mounted = false

  return {
    get title() {
      return options.title
    },
    get editor() {
      return options.editor
    },
    mount(selector: string) {
      const host = document.querySelector(selector)
      if (!host) throw new Error(`mount target not found: ${selector}`)
      host.textContent = options.title
      mounted = true
      return () => {
        host.textContent = ''
        mounted = false
      }
    },
    get mounted() {
      return mounted
    },
  }
}
