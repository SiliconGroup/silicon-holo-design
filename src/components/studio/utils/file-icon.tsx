import type { ReactNode } from 'react'
import type { HoloFileKind } from '../types'
import { inferFileKind } from './file-kind'

const iconClass = 'h-3.5 w-3.5 flex-none'

function Glyph({ path, filled = false }: { path: string; filled?: boolean }) {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 16 16"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

const glyphs = {
  folder: 'M1.75 4.25a1 1 0 0 1 1-1h3.1a1 1 0 0 1 .74.33l.82.92h5.84a1 1 0 0 1 1 1v6.25a1 1 0 0 1-1 1H2.75a1 1 0 0 1-1-1z',
  folderOpen: 'M1.75 4.25a1 1 0 0 1 1-1h3.1a1 1 0 0 1 .74.33l.82.92h5.84a1 1 0 0 1 1 1v1.25M1.75 6.75h12.1l-1.3 5.3a1 1 0 0 1-.97.75H2.75a1 1 0 0 1-1-1z',
  file: 'M4 1.75h4.6l3.4 3.4v9.1H4zM8.6 1.75v3.4H12',
  code: 'M6 6 3.75 8.25 6 10.5m4-4.5 2.25 2.25L10 10.5M4 1.75h4.6l3.4 3.4v9.1H4z',
  markdown: 'M2.25 3.75h11.5v8.5H2.25zM4.5 10.25V5.75l1.75 2.1L8 5.75v4.5m2.25 0V5.75m0 4.5 1.25-1.5m-1.25 1.5L9 8.75',
  image: 'M2.25 3.25h11.5v9.5H2.25zM5.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2m8.25 3.5-3.5-3.25-4.25 4-1.5-1.25-2.25 2',
  pdf: 'M4 1.75h4.6l3.4 3.4v9.1H4zM8.6 1.75v3.4H12M6 8.5h4M6 11h2.5',
  spreadsheet: 'M2.25 3.25h11.5v9.5H2.25zm0 3.25h11.5m0 3.25H2.25M6 3.25v9.5m4-9.5v9.5',
  binary: 'M8 1.75 14 5v6L8 14.25 2 11V5zM8 14.25V8m0 0 6-3m-6 3L2 5',
} as const

const glyphByKind: Record<HoloFileKind, keyof typeof glyphs> = {
  code: 'code',
  markdown: 'markdown',
  pdf: 'pdf',
  spreadsheet: 'spreadsheet',
  image: 'image',
  svg: 'image',
  html: 'code',
  binary: 'binary',
}

/**
 * 默认图标解析器。返回 ReactNode，宿主可以完全不使用它，
 * 也可以只在部分节点上覆盖 HoloTreeNode.icon。
 */
export function resolveFileIcon(input: { fileName: string; kind?: HoloFileKind; isDirectory?: boolean; expanded?: boolean }): ReactNode {
  if (input.isDirectory) return <Glyph path={input.expanded ? glyphs.folderOpen : glyphs.folder} />
  const kind = input.kind ?? inferFileKind({ fileName: input.fileName })
  return <Glyph path={glyphs[glyphByKind[kind]]} />
}
