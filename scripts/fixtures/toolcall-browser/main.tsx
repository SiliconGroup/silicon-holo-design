import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AIToolCallGroup } from '../../../src/components/ai/tool-call-group'
import { AIMessageBubble } from '../../../src/components/ai/message-bubble'
import { HoloCollapse } from '../../../src/components/data-display/collapse'
import { ChatBubble } from '../../../src/components/chat/chat-bubble'
import { HoloButton } from '../../../src/components/general/button'
import { HoloSwitch } from '../../../src/components/data-entry/switch'
import { HoloPagination } from '../../../src/components/navigation/pagination'
import { HoloTab } from '../../../src/components/navigation/tabs'
import { HoloDatePicker } from '../../../src/components/data-entry/date-picker'
import { HoloNumberInput } from '../../../src/components/data-entry/number-input'
import { HoloModal } from '../../../src/components/feedback/modal'
import { HoloDrawer } from '../../../src/components/feedback/drawer'
import { ToastProvider, useToast } from '../../../src/components/feedback/toast'
import { HoloTooltip } from '../../../src/components/data-display/tooltip'
import { HoloPopover } from '../../../src/components/data-display/popover'
import { LocaleProvider, enUS } from '../../../src/locale'
import type { ChatMessage } from '../../../src/types'
import 'virtual:uno.css'
import '../../../src/styles/base.css'

const messages: ChatMessage[] = [
  { id: 'one', role: 'tool', content: '', toolName: 'scan_components', toolStatus: 'complete', toolArguments: '{"scope":"src/components"}', toolResult: '{"valid":true}', toolDuration: 120 },
  { id: 'two', role: 'tool', content: '', toolName: 'inspect_tokens', toolStatus: 'running', toolArguments: '{"scope":"semantic"}', toolDuration: 176 },
  { id: 'three', role: 'tool', content: '', toolName: 'render_preview', toolStatus: 'pending' },
]

const narrowMessages: ChatMessage[] = [
  { id: 'narrow-complete', role: 'tool', content: '', toolName: 'read_workspace', toolStatus: 'complete', toolDuration: 186 },
  { id: 'narrow-running', role: 'tool', content: '', toolName: 'run_quality_gate_with_an_intentionally_long_name', toolStatus: 'running', toolDuration: 1200 },
  { id: 'narrow-pending', role: 'tool', content: '', toolName: 'publish_preview', toolStatus: 'pending' },
]

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
const mermaidMessage: ChatMessage = {
  id: 'mermaid-contract',
  role: 'assistant',
  content: `\`\`\`mermaid
flowchart LR
  subgraph clientGroup["Client Layer"]
    request["User Request"] --> composer["Chat Composer"]
    composer --> validation["Validation Gate"]
  end
  subgraph runtimeGroup["Agent Runtime"]
    validation --> orchestrator{"Orchestrator"}
    orchestrator -->|plan| planner["Planner Agent"]
    orchestrator -->|implement| worker["Worker Agent"]
    planner --> queue[("Shared Task Queue")]
    queue --> worker
  end
  worker --> review["Artifact Review"]
  review -->|revision required| orchestrator
\`\`\``,
}
const codeMessage: ChatMessage = {
  id: 'code-contract',
  role: 'assistant',
  content: 'Use `surface-base` for the shell.\n\n```ts\nconst surface = "base"\n```',
}
const chineseMarkdownMessage: ChatMessage = {
  id: 'chinese-markdown-contract',
  role: 'assistant',
  content: `# 结论先说

中文正文需要保持舒展、清晰，并与 **English emphasis** 共享一致的层级。

完整路径是：\`/Users/spensercai/Dev/JstWorkSpace/JstClawOrg/JstClaw/jstclaw_data/workspaces/extremely-long-session/results/url_that_must_wrap_without_overflow.png\`

- 保持正文节奏
- 降低标题压迫感
- [超长链接也必须在气泡内换行](https://example.com/a/very/long/path/that/must/not/overflow/the/assistant/message/bubble)`,
}

function ToastOnMount() {
  const toast = useToast()
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    toast.info('Overlay toast contract')
  }, [toast])
  return null
}

function App() {
  const [number, setNumber] = useState(10)

  useEffect(() => {
    void (async () => {
      await nextFrame()
      const tooltipTrigger = document.querySelector<HTMLButtonElement>('[data-shd-tooltip-trigger]')
      tooltipTrigger?.focus()
      await nextFrame()
      for (let attempt = 0; attempt < 80; attempt += 1) {
        const mermaid = document.querySelector<HTMLElement>('[data-shd-mermaid]')
        if (mermaid?.querySelector('svg')) break
        if (mermaid?.dataset.shdMermaid === 'error') throw new Error(`Mermaid render failed: ${mermaid.dataset.shdMermaidError}`)
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      const mermaid = document.querySelector<HTMLElement>('[data-shd-mermaid]')
      if (!mermaid?.querySelector('svg')) throw new Error('Complex Mermaid message did not render an SVG.')

      const assistantBubbles = Array.from(document.querySelectorAll<HTMLElement>('[data-shd-chat-bubble="assistant"]'))
      const settledAssistant = assistantBubbles.find(element => !element.hasAttribute('data-shd-state'))
      const streamingAssistant = assistantBubbles.find(element => element.dataset.shdState === 'running')
      if (!settledAssistant || !streamingAssistant) throw new Error('Assistant material fixtures are missing.')
      const settledSignal = getComputedStyle(settledAssistant).getPropertyValue('--shd-bubble-signal').trim()
      const streamingSignal = getComputedStyle(streamingAssistant).getPropertyValue('--shd-bubble-signal').trim()
      if (settledSignal !== streamingSignal) throw new Error(`Streaming assistant changed palette: ${JSON.stringify({ settledSignal, streamingSignal })}`)

      const markdownCode = document.querySelector<HTMLElement>('[data-shd-markdown-code-block="true"]')
      const markdownToolbar = markdownCode?.querySelector<HTMLElement>('.shd-markdown-code-toolbar')
      const markdownPre = markdownCode?.querySelector<HTMLElement>('pre')
      const markdownCodeElement = markdownCode?.querySelector<HTMLElement>('code')
      const highlightedToken = markdownCode?.querySelector<HTMLElement>('.hljs-keyword')
      const inlineCode = document.querySelector<HTMLElement>('[data-shd-inline-code="true"]')
      if (!markdownCode || !markdownToolbar || !markdownPre || !markdownCodeElement || !highlightedToken || !inlineCode) throw new Error('Markdown code material fixtures are incomplete.')
      const preStyle = getComputedStyle(markdownPre)
      const codeStyle = getComputedStyle(markdownCodeElement)
      if (preStyle.borderTopWidth !== '0px' || codeStyle.borderTopWidth !== '0px') throw new Error(`Markdown code retained a nested border: ${JSON.stringify({ pre: preStyle.borderTopWidth, code: codeStyle.borderTopWidth })}`)
      if (codeStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') throw new Error(`Markdown code retained a nested background: ${codeStyle.backgroundColor}`)
      if (getComputedStyle(highlightedToken).backgroundColor !== 'rgba(0, 0, 0, 0)') throw new Error('Markdown syntax token retained an opaque background.')

      const markdownNarrow = document.querySelector<HTMLElement>('[data-shd-markdown-narrow] .shd-markdown-content')
      const inlinePath = markdownNarrow?.querySelector<HTMLElement>('[data-shd-inline-code="true"]')
      if (!markdownNarrow || !inlinePath) throw new Error('Chinese Markdown overflow fixture is missing.')
      const markdownRect = markdownNarrow.getBoundingClientRect()
      const inlineRect = inlinePath.getBoundingClientRect()
      const markdownStyle = getComputedStyle(markdownNarrow)
      if (markdownNarrow.scrollWidth > markdownNarrow.clientWidth + 1 || inlineRect.right > markdownRect.right + 1) {
        throw new Error(`Long Markdown content overflowed its bubble: ${JSON.stringify({ scrollWidth: markdownNarrow.scrollWidth, clientWidth: markdownNarrow.clientWidth, inlineRight: inlineRect.right, markdownRight: markdownRect.right })}`)
      }
      if (!markdownStyle.fontFamily.includes('PingFang SC') || Number.parseFloat(markdownStyle.lineHeight) < 24) {
        throw new Error(`Chinese Markdown typography contract is incomplete: ${JSON.stringify({ fontFamily: markdownStyle.fontFamily, lineHeight: markdownStyle.lineHeight })}`)
      }

      const expectedBorders: Record<string, [string, string, string, string]> = {
        top: ['1px', '0px', '0px', '0px'], right: ['0px', '1px', '0px', '0px'], bottom: ['0px', '0px', '1px', '0px'],
        left: ['0px', '0px', '0px', '1px'], x: ['0px', '1px', '0px', '1px'], y: ['1px', '0px', '1px', '0px'],
      }
      for (const element of Array.from(document.querySelectorAll<HTMLElement>('[data-shd-directional-border]'))) {
        const style = getComputedStyle(element)
        const actual = [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth]
        const expected = expectedBorders[element.dataset.shdDirectionalBorder ?? '']
        if (!expected || actual.some((value, index) => value !== expected[index])) throw new Error(`Directional border is not self-contained: ${JSON.stringify({ direction: element.dataset.shdDirectionalBorder, actual, expected })}`)
      }

      const modalOverlay = document.querySelector<HTMLElement>('[data-shd-overlay="modal"]')
      const toastOverlay = document.querySelector<HTMLElement>('[data-shd-overlay="toast"]')
      const tooltipOverlay = document.querySelector<HTMLElement>('[role="tooltip"]')
      if (!modalOverlay || !toastOverlay || !tooltipOverlay) throw new Error('Semantic overlay fixtures are missing.')
      const modalZ = Number.parseInt(getComputedStyle(modalOverlay).zIndex, 10)
      const toastZ = Number.parseInt(getComputedStyle(toastOverlay).zIndex, 10)
      const tooltipZ = Number.parseInt(getComputedStyle(tooltipOverlay).zIndex, 10)
      if (!(modalZ < toastZ && toastZ < tooltipZ)) throw new Error(`Overlay layers are out of order: ${JSON.stringify({ modalZ, toastZ, tooltipZ })}`)

      const drawerEdges = Array.from(document.querySelectorAll<HTMLElement>('[data-shd-overlay="drawer"] [role="dialog"]')).map(dialog => {
        const style = getComputedStyle(dialog)
        return [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth]
      })
      if (!drawerEdges.some(widths => widths.join(',') === '0px,0px,0px,1px') || !drawerEdges.some(widths => widths.join(',') === '0px,1px,0px,0px')) throw new Error(`Drawer placement borders are invalid: ${JSON.stringify(drawerEdges)}`)

      const cardTrigger = document.querySelector<HTMLElement>('[data-shd-tool-card] > button')
      cardTrigger?.click()
      await nextFrame()

      const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-shd-tool-group] button, [data-shd-collapse] button'))
      const nativeBorders = buttons.map(button => ({
        label: button.textContent?.trim(),
        width: getComputedStyle(button).borderTopWidth,
        style: getComputedStyle(button).borderTopStyle,
      }))
      const invalid = nativeBorders.filter(border => border.width !== '0px' || border.style !== 'none')
      if (invalid.length > 0) throw new Error(`Native button borders remain: ${JSON.stringify(invalid)}`)

      const groupedCards = Array.from(document.querySelectorAll<HTMLElement>('[data-shd-tool-card]'))
      const invalidCards = groupedCards.flatMap(card => {
        const style = getComputedStyle(card)
        return style.borderTopWidth !== '1px' || ['rgb(255, 255, 255)', 'white'].includes(style.borderTopColor)
          ? [{ width: style.borderTopWidth, style: style.borderTopStyle, color: style.borderTopColor }]
          : []
      })
      if (invalidCards.length > 0) throw new Error(`Grouped tool rows lost their semantic low-intensity borders: ${JSON.stringify(invalidCards)}`)

      const structuralBorders = Array.from(document.querySelectorAll<HTMLElement>('[data-shd-tool-group], [data-shd-collapse]'))
      const whiteStructures = structuralBorders.filter(element => ['rgb(255, 255, 255)', 'white'].includes(getComputedStyle(element).borderTopColor))
      if (whiteStructures.length > 0) throw new Error('ToolGroup or Collapse rendered a white structural border.')

      const toolGroup = document.querySelector<HTMLElement>('[data-shd-tool-group]')
      const assistantBubble = document.querySelector<HTMLElement>('[data-shd-chat-bubble="assistant"]')
      if (!toolGroup || !assistantBubble
        || Math.abs(toolGroup.getBoundingClientRect().left - assistantBubble.getBoundingClientRect().left) > 1
        || Math.abs(toolGroup.getBoundingClientRect().right - assistantBubble.getBoundingClientRect().right) > 1) {
        throw new Error(`ToolGroup and assistant messages do not share the same track: ${JSON.stringify({ tool: toolGroup?.getBoundingClientRect(), assistant: assistantBubble?.getBoundingClientRect() })}`)
      }

      const narrowGroup = document.querySelector<HTMLElement>('[data-shd-narrow-group] [data-shd-tool-group]')
      const narrowSummary = narrowGroup?.querySelector<HTMLElement>('[data-shd-tool-summary]')
      const narrowMeta = narrowGroup?.querySelector<HTMLElement>('[data-shd-tool-meta]')
      if (!narrowGroup || !narrowSummary || !narrowMeta
        || narrowMeta.getBoundingClientRect().right > narrowGroup.getBoundingClientRect().right
        || narrowSummary.scrollWidth <= narrowSummary.clientWidth
        || getComputedStyle(narrowMeta).whiteSpace !== 'nowrap') {
        throw new Error(`Narrow ToolGroup did not reserve the completion suffix: ${JSON.stringify({ groupRight: narrowGroup?.getBoundingClientRect().right, metaRight: narrowMeta?.getBoundingClientRect().right, summaryWidth: narrowSummary?.clientWidth, summaryScrollWidth: narrowSummary?.scrollWidth, whiteSpace: narrowMeta ? getComputedStyle(narrowMeta).whiteSpace : undefined })}`)
      }

      const collapseTrigger = document.querySelector<HTMLButtonElement>('[data-shd-collapse] button')
      collapseTrigger?.focus()
      await nextFrame()
      if (!collapseTrigger || getComputedStyle(collapseTrigger).borderTopWidth !== '0px' || getComputedStyle(collapseTrigger).outlineStyle === 'none') {
        throw new Error('Collapse focus must use an independent visible outline without a native border.')
      }

      const designedBorders = Array.from(document.querySelectorAll<HTMLElement>('[data-shd-designed-border] button, button[data-shd-designed-border]'))
      const invalidDesignedBorders = designedBorders.flatMap(element => {
        const style = getComputedStyle(element)
        return style.borderTopWidth !== '1px' || style.borderTopStyle !== 'solid' || ['rgb(255, 255, 255)', 'white'].includes(style.borderTopColor)
          ? [{ text: element.textContent?.trim(), width: style.borderTopWidth, style: style.borderTopStyle, color: style.borderTopColor }]
          : []
      })
      if (invalidDesignedBorders.length > 0) throw new Error(`Designed control borders are invalid: ${JSON.stringify(invalidDesignedBorders)}`)

      const paginationButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-shd-designed-border] [aria-label*="page" i]'))
      const nativePaginationBackgrounds = paginationButtons.filter(button => ['rgb(255, 255, 255)', 'white'].includes(getComputedStyle(button).backgroundColor))
      if (nativePaginationBackgrounds.length > 0) throw new Error('Pagination rendered native white button backgrounds.')

      const tabButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-shd-designed-border] [role="tab"]'))
      const nativeTabBackgrounds = tabButtons.filter(button => ['rgb(255, 255, 255)', 'white'].includes(getComputedStyle(button).backgroundColor))
      if (nativeTabBackgrounds.length > 0) throw new Error('Tabs rendered native white button backgrounds.')

      const switchControl = document.querySelector<HTMLElement>('[role="switch"]')
      const switchThumb = switchControl?.firstElementChild as HTMLElement | undefined
      if (!switchControl || !switchThumb) throw new Error('Switch fixture is missing.')
      const switchRect = switchControl.getBoundingClientRect()
      const thumbRect = switchThumb.getBoundingClientRect()
      const leftInset = thumbRect.left - switchRect.left
      const verticalOffset = Math.abs((thumbRect.top + thumbRect.height / 2) - (switchRect.top + switchRect.height / 2))
      if (leftInset < 1 || leftInset > 4 || verticalOffset > 1) {
        throw new Error(`Off switch thumb is not anchored: ${JSON.stringify({ leftInset, verticalOffset, switchRect, thumbRect })}`)
      }

      const nonWhiteButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-shd-number-input] button, [data-shd-modal-fixture] button, [data-shd-tool-card] > button'))
      const whiteButtons = nonWhiteButtons.flatMap(button => {
        const background = getComputedStyle(button).backgroundColor
        return ['rgb(255, 255, 255)', 'rgba(255, 255, 255, 1)', 'white'].includes(background)
          ? [{ label: button.getAttribute('aria-label') || button.textContent?.trim(), background }]
          : []
      })
      if (whiteButtons.length > 0) throw new Error(`Native white button backgrounds remain: ${JSON.stringify(whiteButtons)}`)

      const readableSurfaces = Array.from(document.querySelectorAll<HTMLElement>('[data-shd-popover-content], [data-shd-modal-content]'))
      const blackText = readableSurfaces.flatMap(element => {
        const color = getComputedStyle(element).color
        return ['rgb(0, 0, 0)', 'black'].includes(color) ? [{ text: element.textContent?.trim(), color }] : []
      })
      if (readableSurfaces.length !== 2 || blackText.length > 0) {
        throw new Error(`Portal text did not inherit semantic foreground: ${JSON.stringify({ count: readableSurfaces.length, blackText })}`)
      }

      document.body.dataset.toolContract = 'pass'
    })().catch(error => {
      document.body.dataset.toolContract = 'fail'
      document.body.dataset.toolError = error instanceof Error ? error.message : String(error)
    })
  }, [])

  return (
    <LocaleProvider locale={enUS}>
      <ToastProvider>
        <ToastOnMount />
      <main className="min-h-screen bg-surface-canvas p-12 text-content-primary">
        <div data-shd-tool-fixture className="mx-auto max-w-4xl">
          <AIToolCallGroup messages={messages} />
          <div className="mt-10">
            <HoloCollapse items={[
              { key: 'one', title: 'Semantic surfaces', content: 'Canvas, base, and raised roles remain distinct.' },
              { key: 'two', title: 'Local focus', content: 'Keyboard focus uses a local spectral edge.' },
              { key: 'three', title: 'Flat structure', content: 'No native white button frame is visible.' },
            ]} />
          </div>
          <div className="mt-10">
            <ChatBubble align="left" timestamp="09:42">Assistant surfaces use restrained cyan and violet spectral layers.</ChatBubble>
            <ChatBubble align="left" streaming timestamp="09:42">Assistant streaming stays on the assistant palette.</ChatBubble>
            <ChatBubble align="right" timestamp="09:43">User messages remain flat and clearly differentiated.</ChatBubble>
            <AIMessageBubble message={codeMessage} />
            <AIMessageBubble message={mermaidMessage} />
            <div className="w-[320px]" data-shd-markdown-narrow><AIMessageBubble message={chineseMarkdownMessage} /></div>
          </div>
          <div className="mt-10 w-[320px]" data-shd-narrow-group>
            <AIToolCallGroup messages={narrowMessages} />
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4" data-shd-designed-border>
            <HoloButton>Primary action</HoloButton>
            <HoloSwitch checked={false} onChange={() => undefined} />
            <HoloPagination current={2} total={50} onChange={() => undefined} />
            <HoloTab items={[{ key: 'one', label: 'One' }, { key: 'two', label: 'Two' }]} activeKey="one" onChange={() => undefined} />
            <HoloDatePicker placeholder="Choose date" onChange={() => undefined} />
          </div>
          <div className="mt-10 max-w-sm" data-shd-number-input>
            <HoloNumberInput value={number} onChange={setNumber} />
          </div>
          <div className="mt-10">
            <HoloPopover open content={<span data-shd-popover-content>Semantic popover text</span>}>
              <button type="button" data-shd-popover-trigger>Open popover</button>
            </HoloPopover>
          </div>
          <div className="mt-10 flex gap-2" aria-hidden="true">
            <span data-shd-directional-border="top" className="border-t border-stroke-default" />
            <span data-shd-directional-border="right" className="border-r border-stroke-default" />
            <span data-shd-directional-border="bottom" className="border-b border-stroke-default" />
            <span data-shd-directional-border="left" className="border-l border-stroke-default" />
            <span data-shd-directional-border="x" className="border-x border-stroke-default" />
            <span data-shd-directional-border="y" className="border-y border-stroke-default" />
          </div>
          <HoloModal open onClose={() => undefined} title="Confirm action" closable>
            <p data-shd-modal-content>Semantic modal text</p>
            <HoloTooltip content="Overlay tooltip contract"><button type="button" data-shd-tooltip-trigger>Tooltip target</button></HoloTooltip>
          </HoloModal>
          <HoloDrawer open onClose={() => undefined} placement="left" title="Left drawer">Left</HoloDrawer>
          <HoloDrawer open onClose={() => undefined} placement="right" title="Right drawer">Right</HoloDrawer>
        </div>
      </main>
      </ToastProvider>
    </LocaleProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
