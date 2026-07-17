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
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.max(1, Math.trunc(pageSize)) : 10
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.trunc(total)) : 0
  const totalPages = Math.ceil(safeTotal / safePageSize)
  
  if (totalPages <= 1) return null

  const normalizedCurrent = Number.isFinite(current) ? Math.trunc(current) : 1
  const safeCurrent = Math.min(totalPages, Math.max(1, normalizedCurrent))
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (safeCurrent <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (safeCurrent >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = safeCurrent - 1; i <= safeCurrent + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showTotal && (
        <span className="text-content-tertiary text-sm mr-4">
          {formatMessage(locale.pagination.total, { total })}
        </span>
      )}
      
      <button
        type="button"
        aria-label={locale.pagination.previous ?? 'Previous page'}
        onClick={() => onChange(safeCurrent - 1)}
        disabled={safeCurrent <= 1}
        className="shd-control-focus w-8 h-8 rounded flex items-center justify-center bg-transparent text-sm border border-stroke-subtle text-content-secondary hover:text-content-primary hover:bg-surface-interactive hover:border-stroke-default disabled:text-content-disabled disabled:cursor-not-allowed"
      >
        ‹
      </button>

      {getPageNumbers().map((page, index) => typeof page === 'number' ? (
        <button
          type="button"
          aria-label={typeof page === 'number' ? `${locale.pagination.page} ${page}` : undefined}
          aria-current={page === safeCurrent ? 'page' : undefined}
          key={index}
          onClick={() => typeof page === 'number' && onChange(page)}
          disabled={typeof page !== 'number'}
          className={`
            shd-control-focus w-8 h-8 rounded flex items-center justify-center text-sm border
            ${page === safeCurrent
              ? 'border-stroke-accent bg-surface-selected text-content-accent'
              : 'border-stroke-subtle bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-interactive'
            }
          `}
        >
          {page}
        </button>
      ) : <span key={index} aria-hidden="true" className="w-8 text-center text-content-tertiary">…</span>)}

      <button
        type="button"
        aria-label={locale.pagination.next ?? 'Next page'}
        onClick={() => onChange(safeCurrent + 1)}
        disabled={safeCurrent >= totalPages}
        className="shd-control-focus w-8 h-8 rounded flex items-center justify-center bg-transparent text-sm border border-stroke-subtle text-content-secondary hover:text-content-primary hover:bg-surface-interactive hover:border-stroke-default disabled:text-content-disabled disabled:cursor-not-allowed"
      >
        ›
      </button>
    </div>
  )
}
