import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { AIToolCallGroup } from '../../../src/components/ai/tool-call-group'
import { HoloCollapse } from '../../../src/components/data-display/collapse'
import { ChatBubble } from '../../../src/components/chat/chat-bubble'
import { HoloButton } from '../../../src/components/general/button'
import { HoloSwitch } from '../../../src/components/data-entry/switch'
import { HoloPagination } from '../../../src/components/navigation/pagination'
import { HoloTab } from '../../../src/components/navigation/tabs'
import { HoloDatePicker } from '../../../src/components/data-entry/date-picker'
import { LocaleProvider, enUS } from '../../../src/locale'
import type { ChatMessage } from '../../../src/types'
import 'virtual:uno.css'
import '../../../src/styles/base.css'

const messages: ChatMessage[] = [
  { id: 'one', role: 'tool', content: '', toolName: 'scan_components', toolStatus: 'complete', toolArguments: '{"scope":"src/components"}', toolResult: '{"valid":true}', toolDuration: 120 },
  { id: 'two', role: 'tool', content: '', toolName: 'inspect_tokens', toolStatus: 'running', toolArguments: '{"scope":"semantic"}', toolDuration: 176 },
  { id: 'three', role: 'tool', content: '', toolName: 'render_preview', toolStatus: 'pending' },
]

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

function App() {
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

      const collapseTrigger = document.querySelector<HTMLButtonElement>('[data-shd-collapse] button')
      collapseTrigger?.focus()
      await nextFrame()
      if (!collapseTrigger || getComputedStyle(collapseTrigger).borderTopWidth !== '0px' || getComputedStyle(collapseTrigger).boxShadow === 'none') {
        throw new Error('Collapse focus must use a local spectral response without a native border.')
      }

      const designedBorders = Array.from(document.querySelectorAll<HTMLElement>('[data-shd-designed-border] button, button[data-shd-designed-border]'))
      const invalidDesignedBorders = designedBorders.flatMap(element => {
        const style = getComputedStyle(element)
        return style.borderTopWidth !== '1px' || style.borderTopStyle !== 'solid' || ['rgb(255, 255, 255)', 'white'].includes(style.borderTopColor)
          ? [{ text: element.textContent?.trim(), width: style.borderTopWidth, style: style.borderTopStyle, color: style.borderTopColor }]
          : []
      })
      if (invalidDesignedBorders.length > 0) throw new Error(`Designed control borders are invalid: ${JSON.stringify(invalidDesignedBorders)}`)

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
          <div className="mt-10 grid grid-cols-2 gap-4" data-shd-designed-border>
            <HoloButton>Primary action</HoloButton>
            <HoloSwitch checked={false} onChange={() => undefined} />
            <HoloPagination current={2} total={50} onChange={() => undefined} />
            <HoloTab items={[{ key: 'one', label: 'One' }, { key: 'two', label: 'Two' }]} activeKey="one" onChange={() => undefined} />
            <HoloDatePicker placeholder="Choose date" onChange={() => undefined} />
          </div>
        </div>
      </main>
    </LocaleProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
