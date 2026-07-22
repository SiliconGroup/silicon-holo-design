import { useState } from 'react'
import { ComponentDemo } from '../ComponentDemo'
import { ChatBubble, ChatInputArea } from '@/components/chat'
import {
  AIMessageBubble,
  ArtifactPreviewDrawer,
  AIToolCallCard,
  AIToolCallGroup,
  AIToolExecutionCard,
  AITaskExecutionPanel,
} from '@/components/ai'
import { HoloButton } from '@/components/general/button'
import { DataStreamEffect } from '@/components/feedback/data-stream-effect'
import type { Artifact, ChatMessage } from '@/types'

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

const partialTasks = {
  description: 'Prepare spectral-flat release',
  tasks: [
    { id: 'tokens', description: 'Refine semantic surface tokens', completed: true, details: 'Canvas, thin-film, inset, and glass roles verified.' },
    { id: 'focus', description: 'Separate focus from selected state', completed: true, details: 'Mouse focus no longer produces an outer cyan frame.' },
    { id: 'showcase', description: 'Capture complete visual regression matrix', status: 'running' as const, progress: 68, details: 'Desktop and narrow layouts remain.' },
  ],
}

const taskStatusMatrix = {
  description: 'Validate every execution outcome in a constrained application panel',
  tasks: [
    { id: 'running', description: 'Render an intentionally long active task description without clipping the status, progress, or application-provided action controls', status: 'running' as const, progress: 42 },
    { id: 'error', description: 'Verify production bundle', status: 'error' as const },
    { id: 'blocked', description: 'Publish release', status: 'blocked' as const },
    { id: 'cancelled', description: 'Deploy preview environment', status: 'cancelled' as const },
    { id: 'skipped', description: 'Notify optional integration', status: 'skipped' as const },
  ],
}

const completedTasks = {
  description: 'Ship compatible component package',
  tasks: [
    { id: 'api', description: 'Verify existing exports', completed: true },
    { id: 'build', description: 'Build package and examples', completed: true },
    { id: 'audit', description: 'Complete independent audits', completed: true },
  ],
}

const markdownMessage: ChatMessage = {
  id: 'assistant-markdown',
  role: 'assistant',
  timestamp: '10:42',
  content: `## Migration assessment

The new surface system keeps the interface **flat**, **semantic**, and compatible with existing application components.

> The visual hierarchy comes from material roles and restrained state color—not decorative gradients.

| Layer | Token | Responsibility |
| --- | --- | --- |
| Canvas | \`surface-canvas\` | Application background |
| Raised | \`surface-raised\` | Cards and persistent controls |
| Glass | \`surface-glass\` | Overlays and contextual panels |

- [x] Preserve public exports
- [x] Verify semantic contrast
- [ ] Complete application visual review

\`\`\`ts
const material = {
  surface: 'var(--shd-surface-raised)',
  stroke: 'var(--shd-stroke-subtle)',
}
\`\`\``,
}

const mathMessage: ChatMessage = {
  id: 'assistant-mathematics',
  role: 'assistant',
  timestamp: '10:43',
  content: String.raw`### Spectral response model

For a state-aware surface, the perceived response can be represented as

$$
\begin{aligned}
S(\lambda, t) &= B(\lambda) + \alpha(t)R_s(\lambda), \\
\alpha(t) &= \operatorname{clamp}\!\left(\frac{p(t)-p_0}{p_1-p_0},0,1\right), \\
L(\theta) &= \sum_{i=1}^{n} w_i\left\|f_\theta(x_i)-y_i\right\|_2^2
 + \beta\int_{\Omega}\left\|\nabla f_\theta(x)\right\|_2^2\,dx.
\end{aligned}
$$

The normalized attention distribution is

$$
P(z_k\mid x)=\frac{\exp\!\left(q(x)^\top k_k/\sqrt{d}\right)}
{\sum_{j=1}^{m}\exp\!\left(q(x)^\top k_j/\sqrt{d}\right)}.
$$`,
}

const mermaidMessage: ChatMessage = {
  id: 'assistant-mermaid',
  role: 'assistant',
  timestamp: '10:44',
  content: `### Multi-agent execution topology

\`\`\`mermaid
flowchart LR
  subgraph Client[Client Layer]
    U[User Request] --> C[Chat Composer]
    C --> V[Validation Gate]
  end

  subgraph Runtime[Agent Runtime]
    V --> O{Orchestrator}
    O -->|plan| P[Planner Agent]
    O -->|research| R[Research Agent]
    O -->|implement| W[Worker Agent]
    P --> Q[(Shared Task Queue)]
    R --> Q
    Q --> W
  end

  subgraph Services[Tool and Data Services]
    W --> T{Tool Router}
    T --> FS[Workspace Files]
    T --> API[External APIs]
    T --> DB[(Session Store)]
  end

  FS --> A[Artifact Review]
  API --> A
  DB --> A
  A -->|approved| OUT[Final Response]
  A -->|revision required| O
\`\`\``,
}

const consoleArtifact: Artifact = {
  id: 'showcase-console-artifact',
  type: 'html',
  title: 'Orbital Operations Console',
  content: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    :root{color-scheme:dark;--bg:#020a0d;--panel:rgba(4,25,30,.82);--line:rgba(93,218,225,.2);--cyan:#55e6ed;--mint:#57f0ba;--muted:#79969d}
    *{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at 78% 0,rgba(17,126,134,.2),transparent 34%),linear-gradient(135deg,#02080b,#031216 52%,#02090c);color:#edfafa;font-family:Inter,system-ui,sans-serif}
    body:before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(81,208,216,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(81,208,216,.035) 1px,transparent 1px);background-size:40px 40px}
    .shell{position:relative;max-width:1180px;margin:auto;padding:30px}.topbar,.panel,.metric{border:1px solid var(--line);background:var(--panel);backdrop-filter:blur(16px)}
    .topbar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 18px;border-radius:14px}.brand{display:flex;align-items:center;gap:12px}.mark{width:32px;height:32px;border:1px solid var(--cyan);border-radius:8px;display:grid;place-items:center;box-shadow:inset 0 0 20px rgba(85,230,237,.09)}
    .eyebrow,.label{font:600 10px/1.2 'JetBrains Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}h1{font-size:16px;margin:2px 0 0}.status{display:flex;align-items:center;gap:8px;color:var(--mint);font:600 11px 'JetBrains Mono',monospace}.pulse{width:8px;height:8px;border-radius:50%;background:var(--mint);box-shadow:0 0 14px var(--mint)}
    .hero{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(260px,.7fr);gap:18px;margin-top:18px}.panel{border-radius:14px;padding:22px}.orbit{position:relative;min-height:350px;overflow:hidden}.planet{position:absolute;width:152px;height:152px;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle at 35% 28%,#8ef5f1,#177985 28%,#07313a 66%,#021217);box-shadow:0 0 70px rgba(64,217,225,.18)}
    .ring{position:absolute;left:50%;top:50%;width:310px;height:128px;border:1px solid rgba(101,226,234,.32);border-radius:50%;transform:translate(-50%,-50%) rotate(-15deg)}.ring:after{content:"";position:absolute;right:42px;top:14px;width:8px;height:8px;border-radius:50%;background:var(--cyan);box-shadow:0 0 14px var(--cyan)}
    .coordinate{position:absolute;font:10px 'JetBrains Mono',monospace;color:var(--muted)}.c1{left:18px;top:20px}.c2{right:18px;bottom:18px}.hero-title{position:absolute;left:22px;bottom:24px}.hero-title strong{display:block;font-size:28px;letter-spacing:-.04em}.hero-title span{color:var(--muted);font-size:12px}
    .metrics{display:grid;gap:10px}.metric{border-radius:10px;padding:15px}.metric-head{display:flex;justify-content:space-between;align-items:center}.metric b{font:600 22px 'JetBrains Mono',monospace}.metric small{color:var(--muted)}.bar{height:3px;background:#10282e;margin-top:13px;overflow:hidden}.bar i{display:block;height:100%;background:linear-gradient(90deg,var(--cyan),var(--mint));width:var(--value)}
    .feed{margin-top:18px}.feed-row{display:grid;grid-template-columns:90px 1fr auto;gap:14px;align-items:center;padding:13px 0;border-top:1px solid rgba(117,211,217,.1);font-size:12px}.feed-row code{color:var(--cyan);font-family:'JetBrains Mono',monospace}.feed-row span{color:#b8cccf}.feed-row em{font-style:normal;color:var(--mint);font:10px 'JetBrains Mono',monospace}
    .actions{display:flex;gap:10px;margin-top:18px}.actions button{appearance:none;border:1px solid var(--line);border-radius:8px;background:rgba(7,39,45,.72);color:#dff8f8;padding:9px 13px;font:600 11px 'JetBrains Mono',monospace;cursor:pointer}.actions button:hover{border-color:var(--cyan);color:var(--cyan)}
    @media(max-width:720px){.shell{padding:14px}.hero{grid-template-columns:1fr}.orbit{min-height:290px}.feed-row{grid-template-columns:72px 1fr}.feed-row em{grid-column:2}.topbar{align-items:flex-start}.status{margin-top:3px}}
  </style>
</head>
<body>
  <main class="shell">
    <header class="topbar"><div class="brand"><div class="mark">◈</div><div><div class="eyebrow">Asteria Network</div><h1>Orbital Operations Console</h1></div></div><div class="status"><i class="pulse"></i><span id="clock">LINK STABLE</span></div></header>
    <section class="hero">
      <article class="panel orbit"><div class="coordinate c1">AZ 147.22° / EL 38.09°</div><div class="coordinate c2">VECTOR 09-A / LIVE</div><div class="ring"></div><div class="planet"></div><div class="hero-title"><strong>KEPLER–186F</strong><span>Deep-space telemetry relay · 492 ly</span></div></article>
      <aside class="metrics">
        <div class="metric"><div class="metric-head"><small>Signal integrity</small><b>98.4%</b></div><div class="bar"><i style="--value:98.4%"></i></div></div>
        <div class="metric"><div class="metric-head"><small>Quantum relay</small><b>42ms</b></div><div class="bar"><i style="--value:74%"></i></div></div>
        <div class="metric"><div class="metric-head"><small>Array capacity</small><b>71.2%</b></div><div class="bar"><i style="--value:71.2%"></i></div></div>
        <div class="panel feed"><div class="label">Recent telemetry</div><div class="feed-row"><code>18:42:09</code><span>Navigation matrix synchronized</span><em>PASS</em></div><div class="feed-row"><code>18:41:52</code><span>External star map loaded</span><em>PASS</em></div><div class="feed-row"><code>18:41:31</code><span>Relay handshake completed</span><em>PASS</em></div><div class="actions"><button onclick="this.textContent='PING 38ms'">PING RELAY</button><button onclick="document.body.classList.toggle('compact')">TOGGLE GRID</button></div></div>
      </aside>
    </section>
  </main>
  <script>setInterval(()=>{document.querySelector('#clock').textContent='LINK STABLE · '+new Date().toLocaleTimeString()},1000)</script>
</body>
</html>`,
}

const topologyArtifact: Artifact = {
  id: 'showcase-topology-artifact',
  type: 'svg',
  title: 'Relay Topology',
  content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560"><defs><radialGradient id="bg"><stop stop-color="#07343a"/><stop offset="1" stop-color="#020a0d"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="900" height="560" fill="url(#bg)"/><g stroke="#16474e" opacity=".45">${Array.from({ length: 18 }, (_, index) => `<path d="M0 ${index * 32}H900"/>`).join('')}${Array.from({ length: 29 }, (_, index) => `<path d="M${index * 32} 0V560"/>`).join('')}</g><g fill="none" stroke="#46dbe4" stroke-width="2" opacity=".48"><path d="M128 402L310 278 476 340 690 166 792 286"/><path d="M310 278L402 116 690 166"/><path d="M476 340L610 438 792 286"/></g><g fill="#061b20" stroke="#55e6ed" stroke-width="3" filter="url(#glow)"><circle cx="128" cy="402" r="18"/><circle cx="310" cy="278" r="23"/><circle cx="402" cy="116" r="14"/><circle cx="476" cy="340" r="18"/><circle cx="610" cy="438" r="14"/><circle cx="690" cy="166" r="28"/><circle cx="792" cy="286" r="17"/></g><g fill="#dffafa" font-family="monospace" font-size="15"><text x="94" y="442">EARTH HUB</text><text x="270" y="324">RELAY 03</text><text x="362" y="88">NODE A7</text><text x="446" y="382">RELAY 12</text><text x="572" y="478">NODE C4</text><text x="648" y="116">KEPLER GATE</text><text x="752" y="330">NODE F2</text></g><text x="42" y="54" fill="#55e6ed" font-family="monospace" font-size="18" letter-spacing="4">QUANTUM RELAY TOPOLOGY</text><text x="42" y="82" fill="#77969d" font-family="monospace" font-size="12">7 ACTIVE NODES · 11 ROUTES · LATENCY 42MS</text></svg>`,
}

const imageArtifact: Artifact = {
  id: 'showcase-remote-image',
  type: 'image',
  title: 'Remote Observation',
  content: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1800&q=85',
}

const markdownArtifact: Artifact = {
  id: 'showcase-markdown-artifact',
  type: 'markdown',
  title: 'Rich Markdown Specification',
  content: '',
  fileName: 'complex-markdown.md',
  mimeType: 'text/markdown',
  source: { kind: 'url', url: '/artifact-preview/complex-markdown.md' },
}

const pdfArtifact: Artifact = {
  id: 'showcase-pdf-artifact',
  type: 'pdf',
  title: 'Tracing JIT Research Paper',
  content: '/artifact-preview/complex-document.pdf',
  fileName: 'complex-document.pdf',
  mimeType: 'application/pdf',
}

const spreadsheetArtifact: Artifact = {
  id: 'showcase-spreadsheet-artifact',
  type: 'xlsx',
  title: 'Operational Workbook',
  content: '',
  fileName: 'complex-workbook.xlsx',
  mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  source: { kind: 'url', url: '/artifact-preview/complex-workbook.xlsx' },
}

export default function ChatAISection() {
  const [latestMessage, setLatestMessage] = useState('')
  const [taskExpanded, setTaskExpanded] = useState(false)
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null)
  const [artifactWidth, setArtifactWidth] = useState('min(48rem, calc(100vw - 16px))')

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

      <ComponentDemo id="ai-message" title="AIMessageBubble" description="Rich Markdown, mathematical notation, and Mermaid diagrams share the same restrained assistant surface">
        <div className="max-w-4xl space-y-5">
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">Markdown · GFM table · task list · code</div>
            <AIMessageBubble message={markdownMessage} enableCopy />
          </div>
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">Mathematics · aligned equations · probability</div>
            <AIMessageBubble message={mathMessage} enableCopy />
          </div>
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">Mermaid · multi-agent execution topology</div>
            <AIMessageBubble message={mermaidMessage} enableCopy />
          </div>
        </div>
      </ComponentDemo>

      <ComponentDemo id="artifact-preview" title="ArtifactPreviewDrawer" description="Modular HTML, Markdown, PDF, spreadsheet, SVG, and image renderers with URL and text resource inputs">
        <div className="grid min-h-32 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <HoloButton onClick={() => { setArtifactWidth('min(56rem, calc(100vw - 16px))'); setActiveArtifact(consoleArtifact) }}>Open HTML console</HoloButton>
          <HoloButton data-testid="open-markdown-artifact" variant="secondary" onClick={() => { setArtifactWidth('min(64rem, calc(100vw - 16px))'); setActiveArtifact(markdownArtifact) }}>Open rich Markdown</HoloButton>
          <HoloButton data-testid="open-pdf-artifact" variant="secondary" onClick={() => { setArtifactWidth('min(72rem, calc(100vw - 16px))'); setActiveArtifact(pdfArtifact) }}>Open complex PDF</HoloButton>
          <HoloButton data-testid="open-spreadsheet-artifact" variant="secondary" onClick={() => { setArtifactWidth('min(76rem, calc(100vw - 16px))'); setActiveArtifact(spreadsheetArtifact) }}>Open XLSX workbook</HoloButton>
          <HoloButton variant="secondary" onClick={() => { setArtifactWidth('min(48rem, calc(100vw - 16px))'); setActiveArtifact(topologyArtifact) }}>Open SVG topology</HoloButton>
          <HoloButton variant="ghost" onClick={() => { setArtifactWidth('min(48rem, calc(100vw - 16px))'); setActiveArtifact(imageArtifact) }}>Open remote image</HoloButton>
          <HoloButton variant="secondary" onClick={() => { setArtifactWidth('320px'); setActiveArtifact(consoleArtifact) }}>Open narrow HTML</HoloButton>
        </div>
        <p className="mt-4 text-xs leading-5 text-content-tertiary">Fixtures are served from the Showcase origin. Markdown covers GFM, KaTeX, Mermaid and code; the PDF is the PDF.js Tracemonkey research sample; the workbook covers multiple sheets, formulas, merges, dates, links, validation, conditional formatting and charts.</p>
        <ArtifactPreviewDrawer artifact={activeArtifact} onClose={() => setActiveArtifact(null)} width={artifactWidth} constrainToViewport />
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

      <ComponentDemo id="task-execution" title="AITaskExecutionPanel" description="Protocol-neutral task summaries with controlled expansion, progress, empty states, and application-defined evidence">
        <div className="grid gap-5 xl:grid-cols-2">
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">Partial · expanded · extended details</div>
            <AITaskExecutionPanel
              taskList={partialTasks}
              defaultExpanded
              headerMeta="4 updates"
              renderTaskDetails={(task) => task.details}
            />
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">Complete · collapsed</div>
              <AITaskExecutionPanel taskList={completedTasks} expanded={taskExpanded} onExpandedChange={setTaskExpanded} headerMeta="controlled" />
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">Empty · expanded</div>
              <AITaskExecutionPanel taskList={{ description: 'Awaiting task plan', tasks: [] }} defaultExpanded />
            </div>
          </div>
        </div>
        <div className="mt-5 max-w-[360px]">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">Narrow · long content · all non-success states</div>
          <AITaskExecutionPanel
            taskList={taskStatusMatrix}
            defaultExpanded
            headerMeta="中文 / EN"
            renderTaskActions={(task) => task.status === 'error' || task.status === 'blocked'
              ? <button
                  type="button"
                  className={`shd-control-focus inline-flex h-7 items-center justify-center rounded-sm border bg-transparent px-2.5 font-mono text-[11px] font-medium leading-none transition-colors ${task.status === 'error'
                    ? 'border-stroke-error text-status-error hover:bg-state-error-soft'
                    : 'border-stroke-warning text-status-warning hover:bg-state-warning-soft'}`}
                >Retry</button>
              : null}
          />
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
