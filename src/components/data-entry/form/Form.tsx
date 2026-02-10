import type { FormEvent, ReactNode } from 'react'

interface HoloFormProps {
  onSubmit: (e: FormEvent) => void
  children: ReactNode
  className?: string
}

export function HoloForm({ onSubmit, children, className = '' }: HoloFormProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  )
}