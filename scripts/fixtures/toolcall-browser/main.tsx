import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AIToolCallGroup } from '../../../src/components/ai/tool-call-group'
import { HoloCollapse } from '../../../src/components/data-display/collapse'
import { ChatBubble } from '../../../src/components/chat/chat-bubble'
import { HoloButton } from '../../../src/components/general/button'
import { HoloSwitch } from '../../../src/components/data-entry/switch'
import { HoloPagination } from '../../../src/components/navigation/pagination'
import { HoloTab } from '../../../src/components/navigation/tabs'
import { HoloDatePicker } from '../../../src/components/data-entry/date-picker'
import { HoloNumberInput } from '../../../src/components/data-entry/number-input'
import { HoloModal } from '../../../src/components/feedback/modal'
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

function App() {
  const [number, setNumber] = useState(10)

  useEffect(() => {
    void (async () => {
      await nextFrame()
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
            <ChatBubble align="right" timestamp="09:43">User messages remain flat and clearly differentiated.</ChatBubble>
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
          <HoloModal open onClose={() => undefined} title="Confirm action" closable>
            <p data-shd-modal-content>Semantic modal text</p>
          </HoloModal>
        </div>
      </main>
    </LocaleProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
