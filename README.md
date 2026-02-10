<p align="center">
  <img src="./assets/logo.svg" width="80" alt="Silicon Holo Design" />
</p>

<h1 align="center">Silicon Holo Design</h1>

<p align="center">
  A holographic sci-fi UI component library for React — with built-in AI/Chat components, i18n, and theming.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/components-58-00e5ff?style=flat-square" alt="58 components" />
  <img src="https://img.shields.io/badge/react-18-61dafb?style=flat-square" alt="React 18" />
  <img src="https://img.shields.io/badge/typescript-5.7-3178c6?style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT" />
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#components">Components</a> ·
  <a href="#ai-chat">AI Chat</a> ·
  <a href="#theming">Theming</a> ·
  <a href="#i18n">i18n</a> ·
  <a href="#examples">Examples</a> ·
  <a href="./README.zh-CN.md">中文文档</a>
</p>

---

## Quick Start

```bash
npm install silicon-holo-design
```

```tsx
import 'silicon-holo-design/styles'
import { HoloButton, LocaleProvider, enUS } from 'silicon-holo-design'

function App() {
  return (
    <LocaleProvider locale={enUS}>
      <HoloButton variant="primary">Hello Holo</HoloButton>
    </LocaleProvider>
  )
}
```

### Styles (Required)

`import 'silicon-holo-design/styles'` is **required** — it provides CSS variables (`--shd-*`) and base styles that all components depend on. Without it, colors and theming will not work.

### UnoCSS Preset

If your project uses UnoCSS, add the preset for full theme and utility class support:

```ts
// uno.config.ts
import { presetSiliconHolo } from 'silicon-holo-design/preset'

export default defineConfig({
  presets: [presetUno(), presetSiliconHolo()],
})
```

The preset includes colors, shortcuts, fonts, and a **safelist** of all CSS classes used by library components. This means you don't need to configure `content.filesystem` or `content.pipeline` to scan `node_modules` — it just works.

### Package Exports

| Path | Content |
|------|---------|
| `silicon-holo-design` | All components, hooks, utilities, types |
| `silicon-holo-design/styles` | CSS variables & base styles (required) |
| `silicon-holo-design/preset` | UnoCSS preset (`presetSiliconHolo`) |
| `silicon-holo-design/ai` | AI/Chat components only |
| `silicon-holo-design/locale/*` | Locale files (`en-US`, `zh-CN`) |

---

## Components

58 components across 7 categories.

### General

| Component | Description |
|-----------|-------------|
| `HoloButton` | Primary action button with glow variants |
| `HoloLink` | Styled anchor link |
| `GlowCard` | Card with holographic glow border |
| `IconButton` | Compact icon-only button |
| `CircuitBorder` | Decorative circuit-pattern border wrapper |

### Layout

| Component | Description |
|-----------|-------------|
| `HoloDivider` | Horizontal divider with optional label |
| `HoloSpace` | Flex spacing container |
| `HoloScrollArea` | Custom-styled scrollable area |

### Navigation

| Component | Description |
|-----------|-------------|
| `HoloBreadcrumb` | Breadcrumb trail |
| `HoloDropdown` | Dropdown menu |
| `HoloPagination` | Page navigation |
| `HoloSteps` | Step indicator |
| `HoloTab` | Tab switcher |
| `HoloAnchor` | Anchor navigation |

### Data Entry

| Component | Description |
|-----------|-------------|
| `HoloInput` | Text input field |
| `HoloTextarea` | Multi-line text input |
| `HoloInputGroup` | Input group wrapper |
| `HoloInputAddon` | Input addon element |
| `HoloSelect` | Dropdown select |
| `HoloCheckbox` | Checkbox control |
| `HoloRadio` / `HoloRadioGroup` | Radio button controls |
| `HoloSwitch` | Toggle switch |
| `HoloSlider` | Range slider |
| `HoloNumberInput` | Numeric input with stepper |
| `HoloDatePicker` | Date picker |
| `HoloUpload` | File upload |
| `HoloForm` / `HoloFormItem` | Form layout with validation |

### Data Display

| Component | Description |
|-----------|-------------|
| `HoloTable` | Data table with sorting |
| `HoloTag` | Colored tag label |
| `HoloBadge` | Notification badge |
| `HoloAvatar` | User avatar |
| `HoloDescriptions` | Key-value description list |
| `HoloTimeline` | Vertical timeline |
| `HoloCollapse` | Collapsible panel |
| `HoloTooltip` | Hover tooltip |
| `HoloPopover` | Click popover |
| `HoloEmpty` | Empty state placeholder |
| `HoloKbd` | Keyboard shortcut indicator |
| `StatusIndicator` | Connection/status dot with customizable labels and colors |

### Feedback

| Component | Description |
|-----------|-------------|
| `HoloModal` | Modal dialog |
| `HoloConfirm` | Confirmation dialog |
| `HoloDrawer` | Slide-in drawer panel |
| `HoloAlert` | Alert banner |
| `HoloProgress` | Progress bar |
| `HoloSkeleton` | Loading skeleton |
| `HoloSpinner` | Spinning loader |
| `HexagonLoader` | Hexagonal loading animation |
| `ToastProvider` / `useToast` | Toast notification system |

### AI / Chat

| Component | Description |
|-----------|-------------|
| `ChatContainer` | Full chat interface (messages + input) |
| `ChatInputArea` | Chat text input with send action |
| `MessageList` | Scrollable message list |
| `MessageBubble` | Single message with Markdown rendering |
| `HtmlPreviewBlock` | Sandboxed HTML preview |
| `ToolExecutionCard` | Tool call status display |
| `CodeBlock` | Syntax-highlighted code block |
| `DataStreamEffect` | Ambient data stream animation |

---

## AI Chat

Build a complete AI chat interface in minutes:

```tsx
import {
  ChatContainer, DataStreamEffect,
  LocaleProvider, ToastProvider, enUS,
} from 'silicon-holo-design'
import type { ChatMessage } from 'silicon-holo-design'

function AIChatApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [processing, setProcessing] = useState(false)
  const [streaming, setStreaming] = useState('')

  const handleSend = (text: string) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }])
    // Call your AI backend, stream response...
  }

  return (
    <LocaleProvider locale={enUS}>
      <ToastProvider>
        <DataStreamEffect />
        <ChatContainer
          messages={messages}
          onSend={handleSend}
          processing={processing}
          streamingContent={streaming}
          showEmptyState={messages.length === 0}
        />
      </ToastProvider>
    </LocaleProvider>
  )
}
```

The `ChatMessage` type supports tool calls:

```ts
interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string
  timestamp?: string
  toolName?: string      // For tool call messages
  toolCallId?: string
  toolResult?: string
}
```

---

## Toast Notifications

Wrap your app with `ToastProvider` and use the `useToast` hook:

```tsx
import { ToastProvider, useToast } from 'silicon-holo-design'

function App() {
  return (
    <ToastProvider>
      <MyPage />
    </ToastProvider>
  )
}

function MyPage() {
  const toast = useToast()
  return (
    <>
      <button onClick={() => toast.success('Saved!')}>Save</button>
      <button onClick={() => toast.error('Something went wrong')}>Error</button>
      <button onClick={() => toast.info('Tip: try dark mode')}>Info</button>
    </>
  )
}
```

---

## StatusIndicator

A generic status dot with label. Default labels are in English; pass `labels` to customize:

```tsx
import { StatusIndicator } from 'silicon-holo-design'

// Default English labels (Connected / Connecting / Disconnected / Error)
<StatusIndicator status="connected" />

// Custom labels (e.g. Chinese)
<StatusIndicator
  status={connectionStatus}
  labels={{ connected: '在线', connecting: '连接中', disconnected: '离线', error: '错误' }}
/>

// Custom colors
<StatusIndicator status="connected" colors={{ connected: '#00ff00' }} />
```

---

## Theming

### CSS Variables

Override CSS variables to customize the theme. All variables use the `--shd-` prefix:

```css
:root {
  --shd-holo-cyan: #00e5ff;
  --shd-holo-green: #00ffaa;
  --shd-holo-purple: #b388ff;
  --shd-scene-void: #000a0e;
  --shd-scene-deep: #001018;
}
```

### ThemeProvider

Or use the React provider for dynamic theming:

```tsx
import { ThemeProvider } from 'silicon-holo-design'

<ThemeProvider theme={{ colors: { 'holo-cyan': '#ff6b35' } }}>
  <App />
</ThemeProvider>
```

### Compatibility

Components also expose legacy variable names (e.g. `--holo-cyan`) as aliases, so existing inline styles continue to work.

---

## i18n

Built-in support for English and Chinese. Wrap your app with `LocaleProvider`:

```tsx
import { LocaleProvider, enUS, zhCN } from 'silicon-holo-design'

// English (default)
<LocaleProvider locale={enUS}><App /></LocaleProvider>

// Chinese
<LocaleProvider locale={zhCN}><App /></LocaleProvider>
```

### Custom Locale

Provide a partial locale to override specific keys:

```tsx
import { enUS } from 'silicon-holo-design'
import type { Locale } from 'silicon-holo-design'

const customLocale: Locale = {
  ...enUS,
  common: { ...enUS.common, confirm: 'OK', cancel: 'Nah' },
}
```

---

## Examples

### `examples/vite-basic`

Minimal setup — buttons, inputs, modals, toasts, and locale switching.

```bash
npm run example:basic
```

### `examples/ai-chat`

Full AI chat interface with streaming simulation, status indicator, and data stream effects.

```bash
npm run example:ai-chat
```

### `examples/component-gallery`

All 58 components rendered on a single page — useful as a visual reference.

```bash
npm run example:gallery
```

### Showcase (Dev)

Interactive component showcase with sidebar navigation (similar to Storybook):

```bash
npm run showcase
# → http://localhost:6007/showcase.html
```

---

## Development

```bash
# Install dependencies
npm install

# Run showcase dev server
npm run showcase

# Type check
npm run typecheck

# Run tests
npm run test

# Build library
npm run build
```

---

## Project Structure

```
silicon-holo-design/
├── src/
│   ├── components/
│   │   ├── general/       # Button, Link, GlowCard, IconButton, CircuitBorder
│   │   ├── layout/        # Divider, Space, ScrollArea
│   │   ├── navigation/    # Breadcrumb, Dropdown, Pagination, Steps, Tab, Anchor
│   │   ├── data-entry/    # Input, Select, Checkbox, Radio, Switch, Slider, ...
│   │   ├── data-display/  # Table, Tag, Badge, Avatar, Tooltip, Popover, ...
│   │   ├── feedback/      # Modal, Drawer, Alert, Progress, Toast, ...
│   │   └── ai/            # ChatContainer, MessageBubble, CodeBlock, ...
│   ├── locale/            # i18n (en-US, zh-CN)
│   ├── theme/             # Theme tokens & provider
│   ├── preset/            # UnoCSS preset
│   ├── styles/            # Base CSS & animations
│   ├── hooks/             # useClickOutside
│   ├── utils/             # cn(), HoloPortal
│   ├── types/             # Shared type definitions
│   └── index.ts           # Main entry — all exports
├── showcases/             # Interactive component showcase
├── examples/              # Standalone usage examples
│   ├── vite-basic/        # Minimal starter
│   ├── ai-chat/           # AI chat demo
│   └── component-gallery/ # Full component reference
└── dev_docs/              # Migration & design docs
```

---

## License

MIT
