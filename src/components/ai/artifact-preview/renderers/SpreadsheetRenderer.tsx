import { useEffect, useMemo, useState } from 'react'
import type { Artifact } from '@/types'
import { useArtifactArrayBuffer } from '../use-artifact-resource'
import { RendererError, RendererLoading } from './RendererState'

interface SheetCell { value: string; formula?: string; formulaResultMissing?: boolean; link?: string; rowSpan?: number; colSpan?: number; hidden?: boolean }
interface SheetModel { name: string; rows: SheetCell[][]; totalRows: number; totalColumns: number; startRow: number; startColumn: number }

function columnName(index: number) {
  let value = index + 1
  let result = ''
  while (value > 0) {
    value -= 1
    result = String.fromCharCode(65 + (value % 26)) + result
    value = Math.floor(value / 26)
  }
  return result
}

export function SpreadsheetRenderer({ artifact }: { artifact: Artifact }) {
  const resource = useArtifactArrayBuffer(artifact)
  const [sheets, setSheets] = useState<SheetModel[]>([])
  const [active, setActive] = useState(0)
  const [parseError, setParseError] = useState<string | null>(null)

  useEffect(() => {
    if (!resource.data) return
    let cancelled = false
    ;(async () => {
      try {
        const XLSX = await import('xlsx')
        const workbook = XLSX.read(resource.data, { type: 'array', cellDates: true, cellFormula: true, cellNF: true, cellStyles: true })
        const models = workbook.SheetNames.map(name => {
          const sheet = workbook.Sheets[name]
          const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1:A1')
          const maxRows = Math.min(range.e.r - range.s.r + 1, 500)
          const maxColumns = Math.min(range.e.c - range.s.c + 1, 100)
          const mergeStarts = new Map<string, { rowSpan: number; colSpan: number }>()
          const merged = new Set<string>()
          for (const merge of sheet['!merges'] ?? []) {
            const start = XLSX.utils.encode_cell(merge.s)
            mergeStarts.set(start, {
              rowSpan: Math.min(merge.e.r, range.s.r + maxRows - 1) - merge.s.r + 1,
              colSpan: Math.min(merge.e.c, range.s.c + maxColumns - 1) - merge.s.c + 1,
            })
            for (let row = merge.s.r; row <= merge.e.r; row += 1) for (let column = merge.s.c; column <= merge.e.c; column += 1) {
              const address = XLSX.utils.encode_cell({ r: row, c: column })
              if (address !== start) merged.add(address)
            }
          }
          const rows = Array.from({ length: maxRows }, (_, rowIndex) => Array.from({ length: maxColumns }, (_, columnIndex) => {
            const address = XLSX.utils.encode_cell({ r: range.s.r + rowIndex, c: range.s.c + columnIndex })
            const cell = sheet[address]
            const span = mergeStarts.get(address)
            const formulaResultMissing = Boolean(cell?.f && cell.t === 'z')
            return {
              value: formulaResultMissing ? '' : cell?.w ?? (cell?.v === undefined ? '' : String(cell.v)),
              formula: cell?.f,
              formulaResultMissing,
              link: cell?.l?.Target,
              rowSpan: span?.rowSpan,
              colSpan: span?.colSpan,
              hidden: merged.has(address),
            }
          }))
          return { name, rows, totalRows: range.e.r - range.s.r + 1, totalColumns: range.e.c - range.s.c + 1, startRow: range.s.r, startColumn: range.s.c }
        })
        if (!cancelled) { setSheets(models); setActive(0); setParseError(null) }
      } catch (reason) {
        if (!cancelled) setParseError(reason instanceof Error ? reason.message : String(reason))
      }
    })()
    return () => { cancelled = true }
  }, [resource.data])

  const sheet = sheets[active]
  const truncated = useMemo(() => Boolean(sheet && (sheet.totalRows > sheet.rows.length || sheet.totalColumns > (sheet.rows[0]?.length ?? 0))), [sheet])
  if (resource.loading || (resource.data && !sheet && !parseError)) return <RendererLoading label="Loading workbook" />
  if (resource.error || parseError) return <RendererError message={resource.error ?? parseError ?? 'Workbook is unavailable'} />
  if (!sheet) return <RendererError message="Workbook contains no worksheets" />

  return <div data-shd-artifact-renderer="spreadsheet" className="flex h-full min-h-0 flex-col bg-surface-canvas">
    <div className="shd-overlay-header shd-scrollbar flex flex-shrink-0 gap-1 overflow-x-auto px-3 py-2">
      {sheets.map((item, index) => <button key={item.name} type="button" onClick={() => setActive(index)} className={`shd-control-focus whitespace-nowrap rounded-sm border px-3 py-1.5 text-xs ${index === active ? 'border-stroke-accent bg-accent-primary-soft text-content-accent' : 'border-stroke-subtle bg-transparent text-content-secondary'}`}>{item.name}</button>)}
    </div>
    {truncated && <div className="border-b border-stroke-subtle bg-state-warning-soft px-3 py-2 text-xs text-status-warning">Preview limited to 500 rows and 100 columns.</div>}
    <div className="shd-scrollbar min-h-0 flex-1 overflow-auto">
      <table className="border-separate border-spacing-0 text-xs text-content-secondary">
        <thead className="sticky top-0 z-20"><tr><th className="sticky left-0 z-30 min-w-12 border-b border-r border-stroke-subtle bg-surface-raised px-2 py-1.5" />{sheet.rows[0]?.map((_, column) => <th key={column} className="min-w-28 border-b border-r border-stroke-subtle bg-surface-raised px-2 py-1.5 font-mono text-content-tertiary">{columnName(sheet.startColumn + column)}</th>)}</tr></thead>
        <tbody>{sheet.rows.map((row, rowIndex) => <tr key={rowIndex}><th className="sticky left-0 z-10 border-b border-r border-stroke-subtle bg-surface-raised px-2 py-1.5 font-mono text-content-tertiary">{sheet.startRow + rowIndex + 1}</th>{row.map((cell, columnIndex) => cell.hidden ? null : <td key={columnIndex} rowSpan={cell.rowSpan} colSpan={cell.colSpan} title={cell.formula ? `=${cell.formula}` : undefined} className={`max-w-80 border-b border-r border-stroke-muted bg-surface-base px-2.5 py-2 align-top text-content-secondary ${cell.rowSpan || cell.colSpan ? 'font-medium text-content-primary' : ''}`}><div className="min-h-4 whitespace-pre-wrap break-words">{cell.link ? <a href={cell.link} target="_blank" rel="noreferrer noopener" className="text-content-accent underline underline-offset-2">{cell.value || cell.link}</a> : cell.value}</div>{cell.formula && <div className="mt-1 font-mono text-[10px] text-content-tertiary">={cell.formula}</div>}{cell.formulaResultMissing && <div className="mt-1 text-[10px] text-status-warning">Cached result unavailable</div>}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </div>
}
