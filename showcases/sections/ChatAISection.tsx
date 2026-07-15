import { useState } from 'react'
import { ComponentDemo } from '../ComponentDemo'
import { ChatBubble, ChatInputArea } from '@/components/chat'
import {
  AIMessageBubble,
  AIToolCallCard,
  AIToolCallGroup,
  AIToolExecutionCard,
} from '@/components/ai'
import { DataStreamEffect } from '@/components/feedback/data-stream-effect'
import type { ChatMessage } from '@/types'

const toolMessages: ChatMessage[] = [
  {
    id: 'tool-read',
    role: 'tool',
    content: '',
    toolName: 'read_workspace',
    toolStatus: 'complete',
    toolArguments: '{"path":"src/components"}',
    toolResult: '{"files":72,"status":"indexed"}',
    toolDuration: 186,
  },
  {
    id: 'tool-analyze',
    role: 'tool',
    content: '',
    toolName: 'analyze_tokens',
    toolStatus: 'complete',
    toolArguments: '{"scope":"semantic-colors"}',
    toolResult: '{"roles":31,"legacyAliases":12}',
    toolDuration: 624,
  },
  {
    id: 'tool-build',
    role: 'tool',
    content: '',
    toolName: 'run_quality_gate',
    toolStatus: 'running',
    toolArguments: '{"tasks":["typecheck","test","build"]}',
    toolDuration: 1240,
  },
]

const singleCompleteGroup: ChatMessage[] = [{
  id: 'single-complete',
  role: 'tool',
  content: '',
  toolName: 'resolve_theme_contract',
  toolStatus: 'complete',
  toolResult: 'Theme contract resolved',
  toolDuration: 142,
}]

const errorGroup: ChatMessage[] = Array.from({ length: 10 }, (_, index) => ({
  id: `error-matrix-${index}`,
  role: 'tool',
  content: '',
  toolName: `validate_surface_${index + 1}`,
  toolStatus: index === 7 ? 'error' : 'complete',
  toolArguments: JSON.stringify({ surface: ['canvas', 'base', 'raised'][index % 3] }),
  toolResult: index === 7 ? 'Contrast threshold not met' : 'Surface verified',
  toolDuration: 96 + index * 21,
})) as ChatMessage[]

const denseToolMessages: ChatMessage[] = Array.from({ length: 12 }, (_, index) => ({
  id: `dense-tool-${index}`,
  role: 'tool',
  content: '',
  toolName: ['scan_component', 'inspect_token', 'validate_state', 'render_fixture'][index % 4] + `_${index + 1}`,
  toolStatus: index === 10 ? 'running' : index === 11 ? 'pending' : 'complete',
  toolArguments: JSON.stringify({ index, scope: index % 2 === 0 ? 'component' : 'semantic-token' }),
  toolResult: index < 10 ? JSON.stringify({ valid: true, duration: 80 + index * 17 }) : undefined,
  toolDuration: index < 10 ? 80 + index * 17 : undefined,
})) as ChatMessage[]

const longPayload = JSON.stringify({
  workspace: '/Users/example/Dev/silicon-holo-design',
  operation: 'inspect_visual_contract',
  constraints: [
    'preserve every public component import path',
    'keep semantic token and UnoCSS consumption equivalent',
    'avoid decorative brackets, unexplained short lines, and nested glowing frames',
    'maintain readable payloads in narrow containers and dense execution histories',
  ],
  components: Array.from({ length: 18 }, (_, index) => ({
    name: `component_${String(index + 1).padStart(2, '0')}`,
    surface: index % 3 === 0 ? 'raised' : 'base',
    status: 'verified',
  })),
}, null, 2)

const markdownMessage: ChatMessage = {
  id: 'assistant-markdown',
  role: 'assistant',
  timestamp: '10:42',
  content: 'The interface now uses **deep-space surfaces**, neutral structural strokes, and local spectral response.\n\n```ts\nconst surface = "var(--shd-surface-raised)"\n```',
}

export default function ChatAISection() {
  const [latestMessage, setLatestMessage] = useState('')

  return (
    <div className="space-y-8">
      <ComponentDemo id="chat-bubble" title="ChatBubble" description="Deep-space message surfaces with precise local spectral hierarchy">
        <div className="grid gap-4 md:grid-cols-2">
          <ChatBubble align="left" timestamp="10:40">System scan complete. No incompatible public exports detected.</ChatBubble>
          <ChatBubble align="right" timestamp="10:41">Apply the spectral-flat visual language without losing the holographic identity.</ChatBubble>
          <div className="md:col-span-2">
            <ChatBubble align="left" timestamp="10:42" streaming>Recalibrating surface contrast and interaction states…</ChatBubble>
          </div>
        </div>
      </ComponentDemo>

      <ComponentDemo id="chat-input" title="ChatInputArea" description="Floating composer with neutral structure and focused spectral response">
        <div className="max-w-3xl">
          <ChatInputArea onSend={setLatestMessage} />
          <p className="mt-3 text-xs text-content-tertiary">Last submitted payload: <span className="font-mono text-content-secondary">{latestMessage || '—'}</span></p>
        </div>
      </ComponentDemo>

      <ComponentDemo id="ai-message" title="AIMessageBubble" description="Markdown, code, and tool output share one restrained technical surface language">
        <div className="max-w-3xl">
          <AIMessageBubble message={markdownMessage} enableCopy />
        </div>
      </ComponentDemo>

      <ComponentDemo id="tool-call-card" title="AIToolCallCard" description="Tool states use compact status signals, neutral structure, and deep technical surfaces">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          <AIToolCallCard name="resolve_dependencies" status="pending" arguments='{"package":"silicon-holo-design"}' />
          <AIToolCallCard name="compile_styles" status="running" arguments='{"preset":"spectral-flat"}' durationMs={932} />
          <AIToolCallCard name="verify_exports" status="complete" result='{"compatible":true,"entries":6}' durationMs={248} />
          <AIToolCallCard name="render_snapshot" status="error" result='{"error":"viewport unavailable"}' durationMs={1204} />
          <AIToolCallCard name="read_release_note" status="complete" result="All public import paths remain compatible." durationMs={118} />
          <AIToolCallCard name="verify_empty_result" status="complete" durationMs={72} />
          <AIToolCallCard name="compile_example" status="complete" result={'```ts\nconst visualLanguage = "spectral-flat"\n```'} durationMs={306} />
        </div>
      </ComponentDemo>

      <ComponentDemo id="tool-call-group" title="AIToolCallGroup" description="Dense execution summaries inspired by production tool panels">
        <div className="grid gap-6 xl:grid-cols-3">
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">1 tool · all complete</div>
            <AIToolCallGroup messages={singleCompleteGroup} />
          </div>
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">3 tools · partially running</div>
            <AIToolCallGroup messages={toolMessages} />
          </div>
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">10 tools · contains error</div>
            <AIToolCallGroup messages={errorGroup} />
          </div>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">12-step audit trail</div>
            <AIToolCallGroup messages={denseToolMessages} />
          </div>
          <div className="w-full max-w-[320px]">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">320px narrow container</div>
            <AIToolCallGroup messages={toolMessages} />
          </div>
        </div>
      </ComponentDemo>

      <ComponentDemo id="tool-long-payload" title="Long Tool Payload" description="Long paths, structured results, and scrolling remain readable without adding another decorative frame">
        <div className="max-w-3xl">
          <AIToolCallCard name="inspect_visual_contract" status="complete" arguments={longPayload} result={longPayload} durationMs={1842} />
        </div>
      </ComponentDemo>

      <ComponentDemo id="tool-execution" title="AIToolExecutionCard" description="Compact standalone execution feedback for long-running actions">
        <div className="grid gap-3 md:grid-cols-3">
          <AIToolExecutionCard toolName="Index workspace" status="running" />
          <AIToolExecutionCard toolName="Validate tokens" status="complete" result="31 semantic roles verified" />
          <AIToolExecutionCard toolName="Capture viewport" status="error" result="Visual driver unavailable" />
        </div>
      </ComponentDemo>

      <ComponentDemo id="data-stream" title="DataStreamEffect" description="A single restrained scan band replaces the former vertical-line burst and collapses to a static signal under reduced motion">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative h-40 overflow-hidden rounded-md border border-stroke-subtle bg-surface-base">
            <DataStreamEffect active />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="font-mono text-sm tracking-[0.16em] text-content-primary">PROCESSING SIGNAL</div>
                <div className="mt-2 text-xs text-content-tertiary">Normal motion</div>
              </div>
            </div>
          </div>
          <div className="relative h-40 overflow-hidden rounded-md border border-stroke-subtle bg-surface-base">
            <div className="absolute inset-x-0 top-1/2 h-16 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,var(--shd-accent-primary-soft),transparent_68%)] opacity-45" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="font-mono text-sm tracking-[0.16em] text-content-primary">STABLE SIGNAL</div>
                <div className="mt-2 text-xs text-content-tertiary">Reduced-motion fallback</div>
              </div>
            </div>
          </div>
        </div>
      </ComponentDemo>
    </div>
  )
}
