import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { LocaleProvider, zhCN } from '@/locale'
import { AITaskExecutionPanel } from './AITaskExecutionPanel'

const taskList = {
  description: 'Prepare release package',
  tasks: [
    { id: 'one', description: 'Build package', completed: true, files: ['dist/index.js'] },
    { id: 'two', description: 'Validate examples', completed: false, files: [] },
  ],
}

describe('AITaskExecutionPanel', () => {
  it('renders progress and toggles an accessible region', () => {
    render(<AITaskExecutionPanel taskList={taskList} headerMeta="4 calls" />)

    const trigger = screen.getByRole('button', { name: /Expand task execution, Pending, 1\/2 complete/ })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByText('1/2 complete')).toBeDefined()
    expect(screen.getByText('4 calls')).toBeDefined()

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('region')).toBeDefined()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50')
    expect(screen.getByText(/Completed:/)).toBeDefined()
    expect(screen.getByText(/Pending:/)).toBeDefined()
  })

  it('supports controlled expansion and extended task details', () => {
    const onExpandedChange = vi.fn()
    const { rerender } = render(
      <AITaskExecutionPanel
        taskList={taskList}
        expanded={false}
        onExpandedChange={onExpandedChange}
        renderTaskDetails={(task) => task.files.join(', ')}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Expand task execution/ }))
    expect(onExpandedChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('region')).toBeNull()

    rerender(<AITaskExecutionPanel taskList={taskList} expanded renderTaskDetails={(task) => task.files.join(', ')} />)
    expect(screen.getByText('dist/index.js')).toBeDefined()
  })

  it('renders localized empty state without invalid progress', () => {
    render(
      <LocaleProvider locale={zhCN}>
        <AITaskExecutionPanel taskList={{ description: '空任务', tasks: [] }} defaultExpanded />
      </LocaleProvider>,
    )

    expect(screen.getByText('暂无任务项')).toBeDefined()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
    expect(screen.getByRole('button', { name: /收起任务执行/ })).toBeDefined()
  })

  it('supports execution statuses, partial progress, custom status mapping, and actions', () => {
    const statusTasks = {
      description: 'Execute release workflow',
      tasks: [
        { id: 'running', description: 'Build artifacts', state: 'active' as const, percent: 42 },
        { id: 'blocked', description: 'Publish package', state: 'blocked' as const },
        { id: 'skipped', description: 'Deploy preview', state: 'skipped' as const },
      ],
    }

    render(
      <AITaskExecutionPanel
        taskList={statusTasks}
        defaultExpanded
        getTaskStatus={(task) => task.state === 'active' ? 'running' : task.state}
        getTaskProgress={(task) => task.percent}
        renderTaskActions={(task) => task.id === 'blocked' ? <button type="button">Retry</button> : null}
      />,
    )

    expect(screen.getByText(/Running:/)).toBeDefined()
    expect(screen.getByText(/Blocked:/)).toBeDefined()
    expect(screen.getByText(/Skipped:/)).toBeDefined()
    expect(screen.getByText('42%')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('14')
  })

  it('reports an all-skipped plan consistently without claiming completion', () => {
    render(
      <AITaskExecutionPanel
        taskList={{ description: 'Optional workflow', tasks: [{ id: 'optional', description: 'Notify integration', status: 'skipped' }] }}
        defaultExpanded
      />,
    )

    expect(screen.getByRole('button', { name: /Skipped, 0\/1 complete/ })).toBeDefined()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
  })

  it('reports cancelled terminal plans without falling back to pending', () => {
    render(
      <AITaskExecutionPanel
        taskList={{
          description: 'Stopped workflow',
          tasks: [
            { id: 'complete', description: 'Prepare input', status: 'completed' },
            { id: 'cancelled', description: 'Publish output', status: 'cancelled' },
          ],
        }}
        defaultExpanded
      />,
    )

    expect(screen.getByRole('button', { name: /Cancelled, 1\/2 complete/ })).toBeDefined()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50')
  })

  it('prioritizes failure over a concurrent running task', () => {
    const { container } = render(
      <AITaskExecutionPanel
        taskList={{
          description: 'Mixed workflow',
          tasks: [
            { id: 'running', description: 'Continue analysis', status: 'running', progress: 40 },
            { id: 'error', description: 'Validate output', status: 'error' },
          ],
        }}
      />,
    )
    const trigger = screen.getByRole('button', { name: /Failed, 0\/2 complete/ })
    expect(trigger.textContent).toContain('×')
    expect(container.querySelector('[data-shd-task-execution="true"]')?.getAttribute('data-shd-task-status')).toBe('error')
  })

  it('exposes summary and item states for the glass material layers', () => {
    const { container } = render(
      <AITaskExecutionPanel
        taskList={{
          description: 'Complete workflow',
          tasks: [
            { id: 'complete', description: 'Ship output', status: 'completed' },
          ],
        }}
        defaultExpanded
      />,
    )

    expect(container.querySelector('[data-shd-task-execution="true"]')?.getAttribute('data-shd-task-status')).toBe('completed')
    expect(container.querySelector('[data-shd-task-item-status="completed"]')).toBeDefined()
    expect(container.querySelector('.shd-task-execution-header')).toBeDefined()
    expect(container.querySelector('.shd-task-execution-body')).toBeDefined()
  })

  it('keeps pending work visible when another task was cancelled', () => {
    render(<AITaskExecutionPanel taskList={{ description: 'Mixed terminal state', tasks: [
      { id: 'cancelled', description: 'Stopped task', status: 'cancelled' },
      { id: 'pending', description: 'Awaiting task', status: 'pending' },
    ] }} />)
    expect(screen.getByRole('button', { name: /Pending, 0\/2 complete/ })).toBeDefined()
  })
})
