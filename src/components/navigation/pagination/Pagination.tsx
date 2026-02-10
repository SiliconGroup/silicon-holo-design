import { useLocale, formatMessage } from '@/locale'

interface HoloPaginationProps {
  current: number
  total: number
  pageSize?: number
  onChange: (page: number) => void
  showTotal?: boolean
  className?: string
}

export function HoloPagination({
  current,
  total,
  pageSize = 10,
  onChange,
  showTotal = false,
  className = '',
}: HoloPaginationProps) {
  const locale = useLocale()
  const totalPages = Math.ceil(total / pageSize)
  
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (current >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showTotal && (
        <span className="text-white/50 text-sm mr-4">
          {formatMessage(locale.pagination.total, { total })}
        </span>
      )}
      
      <button
        onClick={() => onChange(current - 1)}
        disabled={current <= 1}
        className="w-8 h-8 rounded flex items-center justify-center text-sm border border-holo-cyan/20 text-white/50 hover:text-holo-cyan/70 hover:bg-holo-cyan/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ‹
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onChange(page)}
          disabled={typeof page !== 'number'}
          className={`
            w-8 h-8 rounded flex items-center justify-center text-sm border border-holo-cyan/20
            ${page === current
              ? 'border-holo-cyan/40 bg-holo-cyan/10 text-holo-cyan'
              : 'text-white/50 hover:text-holo-cyan/70 hover:bg-holo-cyan/5'
            }
            ${typeof page !== 'number' ? 'cursor-default' : ''}
          `}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current >= totalPages}
        className="w-8 h-8 rounded flex items-center justify-center text-sm border border-holo-cyan/20 text-white/50 hover:text-holo-cyan/70 hover:bg-holo-cyan/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ›
      </button>
    </div>
  )
}