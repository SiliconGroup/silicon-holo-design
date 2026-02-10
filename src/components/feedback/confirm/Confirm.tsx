import type { ReactNode } from 'react'
import { HoloModal } from '@/components/feedback/modal'
import { HoloButton } from '@/components/general/button'
import { useLocale } from '@/locale'

interface HoloConfirmProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string | false
  type?: 'info' | 'success' | 'warning' | 'danger'
  layout?: 'centered' | 'horizontal'
  maskClosable?: boolean
  icon?: ReactNode
  className?: string
}

const typeConfig = {
  info: {
    iconColor: 'text-holo-cyan',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    confirmVariant: 'primary' as const,
  },
  success: {
    iconColor: 'text-status-success',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    confirmVariant: 'success' as const,
  },
  warning: {
    iconColor: 'text-status-warning',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    ),
    confirmVariant: 'warning' as const,
  },
  danger: {
    iconColor: 'text-status-error',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    ),
    confirmVariant: 'danger' as const,
  },
}

export function HoloConfirm({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText,
  cancelText,
  type = 'info',
  layout = 'centered',
  maskClosable = false,
  icon,
  className = '',
}: HoloConfirmProps) {
  const locale = useLocale()
  const resolvedConfirmText = confirmText ?? locale.common.confirm
  const resolvedCancelText = cancelText === false ? false : (cancelText ?? locale.common.cancel)
  const config = typeConfig[type]

  const iconElement = icon ?? (
    <svg
      className={`${layout === 'centered' ? 'w-16 h-16' : 'w-10 h-10'} ${config.iconColor}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      {config.icon}
    </svg>
  )

  const buttons = (
    <>
      {resolvedCancelText !== false && <HoloButton variant="ghost" size={layout === 'horizontal' ? 'sm' : 'md'} onClick={onCancel}>{resolvedCancelText || locale.common.cancel}</HoloButton>}
      <HoloButton variant={config.confirmVariant} size={layout === 'horizontal' ? 'sm' : 'md'} onClick={onConfirm}>{resolvedConfirmText}</HoloButton>
    </>
  )

  if (layout === 'horizontal') {
    return (
      <HoloModal open={open} onClose={onCancel} width="max-w-md" maskClosable={maskClosable} className={className}>
        <div className="flex gap-3 items-center">
          <div className="flex-shrink-0">{iconElement}</div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            {description && <p className="text-white/50 text-sm mt-0.5">{description}</p>}
            <div className="flex gap-3 justify-end mt-4">{buttons}</div>
          </div>
        </div>
      </HoloModal>
    )
  }

  return (
    <HoloModal open={open} onClose={onCancel} width="max-w-sm" maskClosable={maskClosable} className={className}>
      <div className="flex flex-col items-center text-center py-2">
        {iconElement}
        <h3 className="text-xl font-semibold text-white mt-3">{title}</h3>
        {description && <p className="text-white/45 text-sm mt-1.5">{description}</p>}
        <div className="flex gap-3 mt-6">{buttons}</div>
      </div>
    </HoloModal>
  )
}
