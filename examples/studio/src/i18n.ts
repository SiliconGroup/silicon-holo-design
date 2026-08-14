import type { Locale } from '@/index'

/**
 * Strings for the example shell itself.
 *
 * Text inside the components comes from the library locale (`locale.studio.*`); this file only
 * holds the example's own copy. Like the other examples: English by default, switchable to Chinese.
 */
export interface ExampleMessages {
  title: string
  subtitle: string
  editable: string
  closeAll: string
  readOnlyHint: string
  editorHint: string
  history: string
  noCommits: string
  files: string
  changes: string
  staged: string
  unsaved: string
  saved: string
  committed: string
  amended: string
  refreshed: string
  loadFailed: string
  tooLarge: string
  previewLimit: string
  diffBefore: string
  diffAfter: string
  openHint: string
  previewHint: string
  closeDirtyTitle: string
  closeDirtyBody: string
  discardAndClose: string
  keepEditing: string
}

const enUS: ExampleMessages = {
  title: 'Studio Example',
  subtitle: 'Real files served over HTTP, read by path through a manifest',
  editable: 'Editable (inject HoloCodeEditor)',
  closeAll: 'Close all tabs',
  readOnlyHint: 'With the switch off this uses the built-in read-only HoloCodeView, which needs no CodeMirror package at all.',
  editorHint: 'The switch injects HoloCodeEditor from silicon-holo-design/studio/editor.',
  history: 'Commit history',
  noCommits: 'No commits yet',
  files: 'files',
  changes: 'changes',
  staged: 'staged',
  unsaved: 'unsaved',
  saved: 'Saved {path}',
  committed: 'Commit created',
  amended: 'Previous commit amended',
  refreshed: 'Repository status refreshed',
  loadFailed: 'Failed to open {path}',
  tooLarge: '{path} is {size} and exceeds the preview limit',
  previewLimit: 'Preview limit lowered to 32 KB for this demo, so data/telemetry.ndjson shows the oversized placeholder.',
  diffBefore: 'HEAD',
  diffAfter: 'Working tree',
  openHint: 'Single click opens a file. Expand protected/ to see a directory that fails to read.',
  previewHint: 'Single click opens a preview tab (italic) that the next single click replaces. Double click the file or the tab to keep it open; editing pins it too. Markdown and SVG can be switched between Preview and Source.',
  closeDirtyTitle: 'Close without saving?',
  closeDirtyBody: '{path} has unsaved changes. Closing the tab discards them.',
  discardAndClose: 'Discard and close',
  keepEditing: 'Keep editing',
}

const zhCN: ExampleMessages = {
  title: 'Studio 示例',
  subtitle: '通过 HTTP 提供的真实文件，按 manifest 中的路径读取',
  editable: '可编辑（注入 HoloCodeEditor）',
  closeAll: '关闭全部标签',
  readOnlyHint: '关闭开关时走内置只读 HoloCodeView，这条路径不需要安装任何 CodeMirror 包。',
  editorHint: '打开开关会注入 silicon-holo-design/studio/editor 的 HoloCodeEditor。',
  history: '提交历史',
  noCommits: '暂无提交',
  files: '个文件',
  changes: '项变更',
  staged: '已暂存',
  unsaved: '未保存',
  saved: '已保存 {path}',
  committed: '提交完成',
  amended: '已修补上一次提交',
  refreshed: '已刷新仓库状态',
  loadFailed: '无法打开 {path}',
  tooLarge: '{path} 体积 {size}，超过预览上限',
  previewLimit: '本示例把预览上限降到 32 KB，因此 data/telemetry.ndjson 会显示超限占位。',
  diffBefore: 'HEAD',
  diffAfter: '工作区',
  openHint: '单击即可打开文件。展开 protected/ 可以看到读取失败的目录。',
  previewHint: '单击打开的是预览标签（斜体），下一次单击会原地替换它。双击文件或双击标签即固定；编辑同样会固定。Markdown 与 SVG 可以在预览与源码之间切换。',
  closeDirtyTitle: '关闭且不保存？',
  closeDirtyBody: '{path} 有未保存的修改，关闭标签会丢弃它们。',
  discardAndClose: '丢弃并关闭',
  keepEditing: '继续编辑',
}

export const exampleMessages: Record<string, ExampleMessages> = { 'en-US': enUS, 'zh-CN': zhCN }

export function messagesFor(locale: Locale): ExampleMessages {
  return exampleMessages[locale.locale] ?? enUS
}
