import { type ReactNode } from 'react'
import { HexagonLoader } from '@/components/feedback/hexagon-loader'
import { useLocale } from '@/locale'

interface HoloTableColumn<T> {
  key: string
  title: ReactNode
  render?: (value: any, record: T, index: number) => ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface HoloTableProps<T> {
  columns: HoloTableColumn<T>[]
  data: T[]
  rowKey: string | ((record: T) => string)
  loading?: boolean
  emptyText?: string
  className?: string
}

export function HoloTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyText,
  className = '',
}: HoloTableProps<T>) {
  const locale = useLocale()
  const resolvedEmptyText = emptyText ?? locale.table.emptyText
  const getRowKey = (record: T, index: number) => {
    return typeof rowKey === 'function' ? rowKey(record) : record[rowKey] ?? index
  }

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <HexagonLoader size={32} />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <span className="text-white/40 text-sm">{resolvedEmptyText}</span>
      </div>
    )
  }

  return (
    <table className={`w-full border-collapse ${className}`}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className="bg-holo-blue/10 border border-holo-cyan/15 px-3 py-2 text-left text-xs font-semibold text-holo-cyan font-mono"
              style={{ width: column.width, textAlign: column.align }}
            >
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((record, index) => (
          <tr key={getRowKey(record, index)} className="hover:bg-holo-cyan/3">
            {columns.map((column) => (
              <td
                key={column.key}
                className="border border-white/8 px-3 py-2 text-sm text-white/70"
                style={{ textAlign: column.align }}
              >
                {column.render
                  ? column.render(record[column.key], record, index)
                  : record[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}