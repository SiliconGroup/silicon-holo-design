import { describe, it, expect } from 'vitest'
import { formatMessage } from './index'
import enUS from './en-US'
import zhCN from './zh-CN'

describe('Locale', () => {
  it('en-US has all required keys', () => {
    expect(enUS.locale).toBe('en-US')
    expect(enUS.common.confirm).toBe('Confirm')
    expect(enUS.ai.thinking).toBe('Thinking')
    expect(enUS.datePicker.shortWeekdays).toHaveLength(7)
  })

  it('zh-CN has all required keys', () => {
    expect(zhCN.locale).toBe('zh-CN')
    expect(zhCN.common.confirm).toBe('确认')
    expect(zhCN.ai.thinking).toBe('正在思考')
    expect(zhCN.datePicker.shortWeekdays).toHaveLength(7)
  })

  it('formatMessage replaces placeholders', () => {
    expect(formatMessage('Total {total} items', { total: 100 })).toBe('Total 100 items')
    expect(formatMessage('共 {total} 条', { total: 50 })).toBe('共 50 条')
  })
})
