import { describe, it, expect } from 'vitest'
import { formatMessage } from './index'
import enUS from './en-US'
import zhCN from './zh-CN'

describe('Locale', () => {
  it('en-US has all required keys', () => {
    expect(enUS.locale).toBe('en-US')
    expect(enUS.common.confirm).toBe('Confirm')
    expect(enUS.chat.inputPlaceholder).toBe('Type a message...')
    expect(enUS.chat.codeTab).toBe('Code')
    expect(enUS.ai.thinking).toBe('Thinking')
    expect(enUS.datePicker.shortWeekdays).toHaveLength(7)
  })

  it('zh-CN has all required keys', () => {
    expect(zhCN.locale).toBe('zh-CN')
    expect(zhCN.common.confirm).toBe('确认')
    expect(zhCN.chat.inputPlaceholder).toBe('输入消息...')
    expect(zhCN.chat.codeTab).toBe('代码')
    expect(zhCN.ai.thinking).toBe('正在思考')
    expect(zhCN.datePicker.shortWeekdays).toHaveLength(7)
  })

  it('formatMessage replaces placeholders', () => {
    expect(formatMessage('Total {total} items', { total: 100 })).toBe('Total 100 items')
    expect(formatMessage('共 {total} 条', { total: 50 })).toBe('共 50 条')
  })

  it('keeps the studio group aligned across locales', () => {
    const en = Object.keys(enUS.studio ?? {}).sort()
    const zh = Object.keys(zhCN.studio ?? {}).sort()
    expect(en.length).toBeGreaterThan(0)
    expect(zh).toEqual(en)
  })

  it('leaves no studio message empty', () => {
    for (const locale of [enUS, zhCN]) {
      for (const [key, value] of Object.entries(locale.studio ?? {})) {
        expect(typeof value, `${locale.locale}.studio.${key}`).toBe('string')
        expect(value.length, `${locale.locale}.studio.${key}`).toBeGreaterThan(0)
      }
    }
  })
})
