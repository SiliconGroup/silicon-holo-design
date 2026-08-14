import { describe, expect, it, vi } from 'vitest'
import { useEffect } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ToastProvider, useToast } from './Toast'
import { LocaleProvider, zhCN } from '@/locale'

function Trigger() {
  const toast = useToast()
  return <button type="button" onClick={() => toast.error('Build failed')}>Notify</button>
}

function DoubleTrigger() {
  const toast = useToast()
  return <button type="button" onClick={() => { toast.info('First'); toast.info('Second') }}>Notify twice</button>
}

describe('ToastProvider', () => {
  it('uses the semantic toast layer above blocking overlays', () => {
    render(<ToastProvider><span>Ready</span></ToastProvider>)
    expect(screen.getByRole('region', { name: 'Notifications' }).className).toContain('shd-z-toast')
  })

  it('mounts the live region before the first notification', () => {
    render(<ToastProvider><Trigger /></ToastProvider>)
    expect(screen.getByRole('region', { name: 'Notifications' }).textContent).toBe('')
  })

  it('announces dynamically inserted notifications', () => {
    render(<ToastProvider><Trigger /></ToastProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Notify' }))

    const region = screen.getByRole('region', { name: 'Notifications' })
    expect(region.getAttribute('aria-live')).toBe('polite')
    const message = screen.getByText('Build failed')
    expect(message.className).toContain('min-w-0')
    expect(message.className).toContain('[overflow-wrap:anywhere]')
    expect(message.closest('button')?.className).toContain('calc(100vw-32px)')
  })

  it('localizes the notification region label', () => {
    render(<LocaleProvider locale={zhCN}><ToastProvider><Trigger /></ToastProvider></LocaleProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Notify' }))
    expect(screen.getByRole('region', { name: '通知' })).toBeDefined()
  })

  it('keeps notifications distinct when created in the same millisecond', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000)
    render(<ToastProvider><DoubleTrigger /></ToastProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Notify twice' }))
    expect(screen.getByText('First')).toBeDefined()
    expect(screen.getByText('Second')).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'First' }))
    expect(screen.queryByText('First')).toBeNull()
    expect(screen.getByText('Second')).toBeDefined()
    vi.restoreAllMocks()
  })

  it('stays paused until both hover and focus have ended', () => {
    vi.useFakeTimers()
    render(<ToastProvider><Trigger /></ToastProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Notify' }))
    const notification = screen.getByRole('button', { name: 'Build failed' })

    fireEvent.mouseEnter(notification)
    fireEvent.focus(notification)
    fireEvent.mouseLeave(notification)
    act(() => vi.advanceTimersByTime(TOAST_TEST_DURATION))
    expect(screen.getByRole('button', { name: 'Build failed' })).toBeDefined()

    fireEvent.blur(notification)
    act(() => vi.advanceTimersByTime(TOAST_TEST_DURATION))
    expect(screen.queryByRole('button', { name: 'Build failed' })).toBeNull()
    vi.useRealTimers()
  })
})

const TOAST_TEST_DURATION = 8000

describe('ToastProvider context identity', () => {
  it('keeps a stable identity so consumer effects do not re-run on every toast', () => {
    const seen: unknown[] = []
    function Consumer() {
      const toast = useToast()
      useEffect(() => { seen.push(toast) }, [toast])
      return <button type="button" onClick={() => toast.info('notification body')}>trigger</button>
    }
    render(<ToastProvider><Consumer /></ToastProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'trigger' }))
    fireEvent.click(screen.getByRole('button', { name: 'trigger' }))
    // 不稳定的 context value 会让 [toast] 依赖的副作用在每次弹 toast 时重跑
    expect(seen).toHaveLength(1)
  })
})
