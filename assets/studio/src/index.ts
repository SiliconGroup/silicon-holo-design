import { createConsole } from './app'
import { formatTitle } from './lib/format'
import { createEditorState } from './features/editor/state'

const console_ = createConsole({
  title: formatTitle('orbital'),
  editor: createEditorState(),
})

console_.mount('#root')

export { console_ as orbitalConsole }
