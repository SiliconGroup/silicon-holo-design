import type { Locale } from './types'
const zhCN: Locale = {
  locale: 'zh-CN',
  common: {
    confirm: '确认', cancel: '取消', close: '关闭', loading: '加载中', empty: '暂无数据',
    search: '搜索', reset: '重置', submit: '提交', save: '保存', delete: '删除',
    edit: '编辑', more: '更多', expand: '展开', collapse: '收起', selectAll: '全选',
  },
  modal: { okText: '确定', cancelText: '取消' },
  pagination: { total: '共 {total} 条', itemsPerPage: '条/页', goto: '前往', page: '页' },
  table: { emptyText: '暂无数据', sortAscend: '升序', sortDescend: '降序', filterConfirm: '确定', filterReset: '重置' },
  select: { placeholder: '请选择...', noData: '暂无数据', searchPlaceholder: '搜索...' },
  upload: { dragText: '点击或拖拽文件到此处', clickText: '点击上传', limitText: '最多上传 {limit} 个文件' },
  datePicker: {
    placeholder: '选择日期',
    months: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
    shortMonths: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    weekdays: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
    shortWeekdays: ['日','一','二','三','四','五','六'],
    today: '今天', monthYearFormat: '{year}年 {month}',
  },
  ai: {
    thinking: '正在思考', thinkingDescription: 'AI 正在处理您的请求...',
    generating: '生成中', copy: '复制', copied: '已复制', retry: '重试', stop: '停止',
    newConversation: '开始新的对话', newConversationHint: '输入消息与 AI 助手交流',
    selectSession: '选择或创建会话', selectSessionHint: '从左侧选择一个现有会话，或创建新会话开始与 AI 助手交流',
    inputPlaceholder: '输入消息...', inputAriaLabel: '聊天消息输入',
    sendButton: '发送', shiftEnterHint: 'Shift+Enter 换行',
    suggestCode: '写一段代码', suggestExplain: '解释概念', suggestAnalyze: '分析问题',
    toolRunning: '执行中...', toolComplete: '已完成', toolError: '执行失败', toolPending: '等待中',
    codeTab: '代码', previewTab: '预览',
  },
}
export default zhCN
