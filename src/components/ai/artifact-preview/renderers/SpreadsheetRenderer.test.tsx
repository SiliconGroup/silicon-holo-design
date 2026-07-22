import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as XLSX from 'xlsx'
import { SpreadsheetRenderer } from './SpreadsheetRenderer'

describe('SpreadsheetRenderer', () => {
  it('renders worksheets, merged cells, formulas, and links from an ArrayBuffer', async () => {
    const workbook = XLSX.utils.book_new()
    const summary = XLSX.utils.aoa_to_sheet([
      ['Operational summary', '', ''],
      ['Metric', 'Value', 'Formula'],
      ['Canvas', 12, { f: 'B3*2', v: 24 }],
      ['Raised', 8, { f: 'B4*2' }],
    ])
    summary['!merges'] = [XLSX.utils.decode_range('A1:C1')]
    summary.A3.l = { Target: 'https://example.com' }
    XLSX.utils.book_append_sheet(workbook, summary, 'Summary')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['Name'], ['ArtifactPreviewDrawer']]), 'Inventory')
    const data = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
    const { container } = render(<SpreadsheetRenderer artifact={{ id: 'sheet', type: 'xlsx', content: '', source: { kind: 'arrayBuffer', data } }} />)
    expect(await screen.findByRole('button', { name: 'Summary' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Inventory' })).toBeDefined()
    expect(screen.getByText('Operational summary').closest('td')?.colSpan).toBe(3)
    expect(screen.getByText('24')).toBeDefined()
    expect(screen.getByText('=B3*2')).toBeDefined()
    expect(screen.getByText('Cached result unavailable')).toBeDefined()
    expect(screen.getByText('=B4*2').closest('td')?.textContent).not.toContain('0')
    expect(container.querySelector('a[href="https://example.com"]')).not.toBeNull()
  })
})
