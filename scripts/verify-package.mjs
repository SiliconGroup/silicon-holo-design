import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { globSync } from 'glob'

const root = resolve(new URL('..', import.meta.url).pathname)
const workspace = mkdtempSync(join(tmpdir(), 'silicon-holo-consumer-'))
const packDirectory = join(workspace, 'package')
const consumerDirectory = join(workspace, 'consumer')
const expectedPublicExports = {
  'silicon-holo-design': [
  'AIChatContainer', 'AIMessageBubble', 'AIMessageList', 'AITaskExecutionPanel', 'AIToolCallCard', 'AIToolCallGroup',
  'AIToolExecutionCard', 'ArtifactPreviewDrawer', 'ChatBubble', 'ChatContainer', 'ChatInputArea',
  'ChatMessageList', 'CircuitBorder', 'CodeBlock', 'DataStreamEffect', 'GlowCard', 'HexagonLoader',
  'HoloAlert', 'HoloAnchor', 'HoloAvatar', 'HoloBadge', 'HoloBreadcrumb', 'HoloButton',
  'HoloCheckbox', 'HoloCollapse', 'HoloConfirm', 'HoloDatePicker', 'HoloDescriptions',
  'HoloDivider', 'HoloDrawer', 'HoloDropdown', 'HoloEmpty', 'HoloForm', 'HoloFormItem',
  'HoloInput', 'HoloInputAddon', 'HoloInputGroup', 'HoloKbd', 'HoloLink', 'HoloModal',
  'HoloNumberInput', 'HoloPagination', 'HoloPopover', 'HoloPortal', 'HoloProgress', 'HoloRadio',
  'HoloRadioGroup', 'HoloScrollArea', 'HoloSelect', 'HoloSkeleton', 'HoloSlider', 'HoloSpace',
  'HoloSpinner', 'HoloSteps', 'HoloSwitch', 'HoloTab', 'HoloTable', 'HoloTag', 'HoloTextarea',
  'HoloTimeline', 'HoloTooltip', 'HoloUpload', 'HtmlPreviewBlock', 'IconButton', 'LocaleProvider',
  'MessageBubble', 'MessageList', 'StatusIndicator', 'ThemeProvider', 'ThemeStyle', 'ToastProvider',
  'ToolExecutionCard', 'cn', 'createThemeCss', 'defaultSemanticTokens', 'defaultTokens', 'enUS', 'formatMessage',
  'isFullHtmlPage', 'presetSiliconHolo', 'useClickOutside', 'useLocale', 'useTheme', 'useToast', 'zhCN',
  ],
  'silicon-holo-design/chat': ['ChatBubble', 'ChatInputArea', 'ChatMessageList'],
  'silicon-holo-design/ai': ['AIChatContainer', 'AIMessageBubble', 'AIMessageList', 'AITaskExecutionPanel', 'AIToolCallCard', 'AIToolCallGroup', 'AIToolExecutionCard', 'ArtifactPreviewDrawer'],
  'silicon-holo-design/preset': ['colors', 'presetSiliconHolo', 'shortcuts'],
  'silicon-holo-design/locale/en-US': ['default'],
  'silicon-holo-design/locale/zh-CN': ['default'],
}

function run(command, args, cwd, env = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  })
  if (result.status !== 0) {
    process.stderr.write(result.stdout)
    process.stderr.write(result.stderr)
    throw new Error(`${command} ${args.join(' ')} failed`)
  }
  return result.stdout.trim()
}

try {
  const rootEntry = await import(new URL('../dist/index.js', import.meta.url))
  const missingExports = expectedPublicExports['silicon-holo-design'].filter(name => !(name in rootEntry))
  if (missingExports.length > 0) throw new Error(`public export baseline is missing: ${missingExports.join(', ')}`)

  mkdirSync(packDirectory)
  mkdirSync(join(consumerDirectory, 'src'), { recursive: true })

  const packedName = run(
    'npm',
    ['pack', '--silent', '--pack-destination', packDirectory],
    root,
    { SHD_SKIP_PREPARE: '1' }
  ).split('\n').at(-1)
  if (!packedName) throw new Error('npm pack did not return a tarball name')
  const tarball = join(packDirectory, packedName)

  writeFileSync(join(consumerDirectory, 'package.json'), JSON.stringify({
    private: true,
    type: 'module',
    dependencies: {
      '@types/react': '^18.3.0',
      '@types/react-dom': '^18.3.0',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      '@unocss/preset-uno': '^0.65.3',
      'silicon-holo-design': `file:${tarball}`,
      typescript: '^5.7.2',
      unocss: '^0.65.3',
      vite: '^6.0.0',
    },
  }, null, 2))
  writeFileSync(join(consumerDirectory, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      moduleResolution: 'Bundler',
      strict: true,
      skipLibCheck: true,
      jsx: 'react-jsx',
      noEmit: true,
    },
    include: ['src'],
  }, null, 2))
  writeFileSync(join(consumerDirectory, 'index.html'), '<div id="root"></div><script type="module" src="/src/main.tsx"></script>')
  writeFileSync(join(consumerDirectory, 'vite.styles.config.ts'), `
import { defineConfig } from 'vite'
export default defineConfig({})
`)
  writeFileSync(join(consumerDirectory, 'vite.preset.config.ts'), `
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
export default defineConfig({ plugins: [UnoCSS()] })
`)
  writeFileSync(join(consumerDirectory, 'uno.config.ts'), `
import { defineConfig } from 'unocss'
import { presetUno } from '@unocss/preset-uno'
import { presetSiliconHolo } from 'silicon-holo-design/preset'
export default defineConfig({ presets: [presetUno(), presetSiliconHolo()] })
`)
  writeFileSync(join(consumerDirectory, 'src/main.tsx'), `
import React from 'react'
import { createRoot } from 'react-dom/client'
import 'silicon-holo-design/styles'
import {
  ChatContainer,
  HoloAlert,
  HoloButton,
  HoloInput,
  HoloProgress,
  HoloSpinner,
  HoloTag,
  IconButton,
  LocaleProvider,
  MessageBubble,
  MessageList,
  StatusIndicator,
  ThemeProvider,
  ToolExecutionCard,
  type ChatMessage,
  type ToolStatus,
} from 'silicon-holo-design'
import { ChatBubble } from 'silicon-holo-design/chat'
import { AIToolCallCard } from 'silicon-holo-design/ai'
import { presetSiliconHolo } from 'silicon-holo-design/preset'
import enUS from 'silicon-holo-design/locale/en-US'
import zhCN from 'silicon-holo-design/locale/zh-CN'

const preset = presetSiliconHolo()
const locale = navigator.language.startsWith('zh') ? zhCN : enUS
const buttonVariants = ['primary', 'secondary', 'ghost', 'success', 'warning', 'danger'] as const
const buttonSizes = ['sm', 'md', 'lg'] as const
const iconVariants = ['default', 'ghost', 'glow', 'danger'] as const
const alertTypes = ['info', 'success', 'warning', 'error'] as const
const toolStatuses: ToolStatus[] = ['pending', 'running', 'complete', 'error']
const inputStatuses = [undefined, 'success', 'error'] as const
const legacyMessage: ChatMessage = { id: 'legacy', role: 'assistant', content: 'Deprecated aliases still compile.' }

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={{ colors: { 'holo-cyan': '#53e8ef' } }}>
      <LocaleProvider locale={locale}>
        <main data-preset={preset.name}>
          {buttonVariants.flatMap(variant => buttonSizes.map(size => <HoloButton key={variant + size} variant={variant} size={size}>{variant}</HoloButton>))}
          {iconVariants.map(variant => <IconButton key={variant} variant={variant} title={variant}>×</IconButton>)}
          {alertTypes.map(type => <HoloAlert key={type} type={type} title={type} />)}
          {inputStatuses.map(status => <HoloInput key={status ?? 'default'} status={status} size="sm" />)}
          <HoloInput variant="ghost" size="lg" />
          <HoloProgress percent={42} status="normal" size="sm" />
          <HoloProgress percent={100} status="success" size="md" />
          <HoloProgress percent={42} status="error" />
          {buttonSizes.map(size => <HoloSpinner key={size} size={size} />)}
          {(['cyan', 'blue', 'green', 'purple', 'error', 'warning'] as const).map(color => <HoloTag key={color} color={color} size="sm">{color}</HoloTag>)}
          {(['connected', 'connecting', 'disconnected', 'error'] as const).map(status => <StatusIndicator key={status} status={status} />)}
          <ChatBubble align="left">Styles entry is active.</ChatBubble>
          {toolStatuses.map(status => <AIToolCallCard key={status} name={'verify_' + status} status={status} durationMs={12} />)}
          <MessageBubble message={legacyMessage} />
          <MessageList messages={[legacyMessage]} />
          <ChatContainer messages={[legacyMessage]} onSend={() => {}} />
          {toolStatuses.map(status => <ToolExecutionCard key={status} toolName={status} status={status} />)}
        </main>
      </LocaleProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
`)
  writeFileSync(join(consumerDirectory, 'src/preset-only.tsx'), `
import 'virtual:uno.css'
import React from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <main className="flex-center shd-focus-ring bg-surface-raised border border-stroke-accent text-content-primary">
    Preset consumer
  </main>,
)
`)
  writeFileSync(join(consumerDirectory, 'src/compatibility.tsx'), `
import React from 'react'
import * as Root from 'silicon-holo-design'
import * as Chat from 'silicon-holo-design/chat'
import * as AI from 'silicon-holo-design/ai'
import * as Preset from 'silicon-holo-design/preset'
import enUS from 'silicon-holo-design/locale/en-US'
import zhCN from 'silicon-holo-design/locale/zh-CN'
import type {
  Artifact,
  ArtifactPreviewDrawerProps,
  ArtifactType,
  ChatMessage,
  ConnectionStatus,
  FileArtifact,
  HoloInputProps,
  HoloTextareaProps,
  Locale,
  MessageRole,
  ResolvedThemeTokens,
  SemanticThemeTokens,
  Size,
  Status,
  ThemeOverride,
  ThemeProviderProps,
  ThemeTokens,
  ToolStatus,
} from 'silicon-holo-design'

const noop = () => {}
const setString = (_value: string) => {}
const setBoolean = (_value: boolean) => {}
const setNumber = (_value: number) => {}
const setStringOrArray = (_value: string | string[]) => {}
const publicSizes: Size[] = ['sm', 'md', 'lg']
const publicStatuses: Status[] = ['success', 'warning', 'error', 'info']
const connectionStatuses: ConnectionStatus[] = ['connected', 'disconnected', 'connecting', 'error']
const messageRoles: MessageRole[] = ['user', 'assistant', 'tool', 'system']
const toolStatuses: ToolStatus[] = ['pending', 'running', 'complete', 'error']
const artifactTypes: ArtifactType[] = ['html', 'image', 'svg', 'custom-renderer']
const message: ChatMessage = { id: 'fixture', role: 'assistant', content: 'fixture', timestamp: 'now', toolName: 'tool', toolCallId: 'call', toolResult: 'result', toolStatus: 'complete', toolArguments: '{}', toolDuration: 1, toolMetadata: '{}' }
const toolMessage: ChatMessage = { id: 'tool', role: 'tool', content: '', toolName: 'fixture', toolStatus: 'complete' }
const fileArtifact: FileArtifact = { path: '/tmp/file.txt', mime_type: 'text/plain', file_name: 'file.txt' }
const artifact: Artifact = { id: 'artifact', type: 'html', title: 'Artifact', content: '<p>fixture</p>', messageId: 'fixture' }
const locales: Locale[] = [enUS, zhCN]
const legacyThemeTokens: ThemeTokens = Root.defaultTokens
const semanticThemeTokens: SemanticThemeTokens = Root.defaultSemanticTokens
const resolvedThemeTokens: ResolvedThemeTokens = { ...legacyThemeTokens, semanticColors: semanticThemeTokens.colors }
const themeOverride: ThemeOverride = { colors: { 'holo-cyan': '#00ffff' }, semanticColors: { 'surface-base': '#001018' } }
const themeProviderProps: ThemeProviderProps = { theme: themeOverride, children: <span /> }
const inputProps: HoloInputProps = { size: 'md', variant: 'default', status: 'success', prefix: <span />, suffix: <span />, onChange: () => {}, grouped: false }
const textareaProps: HoloTextareaProps = { size: 'md', variant: 'ghost', status: 'error', onChange: () => {}, autoResize: true, maxAutoHeight: 200, onSubmit: noop, grouped: false }
const artifactDrawerProps: ArtifactPreviewDrawerProps = { artifact, onClose: noop, width: '50vw', renderers: { html: () => <span /> } }
const options = [{ value: 'one', label: 'One', disabled: false }]

void [publicSizes, publicStatuses, connectionStatuses, messageRoles, toolStatuses, artifactTypes, fileArtifact, locales, resolvedThemeTokens, themeProviderProps, inputProps, textareaProps, artifactDrawerProps]

function HookFixture() {
  const ref = React.useRef<HTMLDivElement>(null)
  Root.useClickOutside(ref, noop)
  const theme = Root.useTheme()
  const locale = Root.useLocale()
  const toast = Root.useToast()
  return <div ref={ref} data-theme={theme.colors['holo-cyan']} data-locale={locale.locale} data-class={Root.cn('one', false && 'two')} data-html={Root.isFullHtmlPage('<html />')} onClick={() => toast.info(Root.formatMessage('{count}', { count: 1 }))} />
}

export const compatibilityFixture = (
  <>
    {(['primary', 'secondary', 'ghost', 'success', 'warning', 'danger'] as const).map(variant => (['sm', 'md', 'lg'] as const).map(size => <Root.HoloButton key={variant + size} variant={variant} size={size} onClick={noop} className="fixture" icon={<span />} fullWidth disabled>{variant}</Root.HoloButton>))}
    {(['default', 'ghost', 'glow', 'danger'] as const).map(variant => (['sm', 'md', 'lg'] as const).map(size => <Root.IconButton key={variant + size} variant={variant} size={size} onClick={noop} className="fixture" disabled title="fixture">×</Root.IconButton>))}
    {(['default', 'elevated', 'intense'] as const).map(variant => <Root.GlowCard key={variant} variant={variant} hoverEffect onClick={noop} className="fixture">card</Root.GlowCard>)}
    <Root.CircuitBorder animated className="fixture">circuit</Root.CircuitBorder><Root.CodeBlock className="language-ts" title="code">const fixture = true</Root.CodeBlock>
    <Root.HoloLink href="https://example.com" external disabled className="fixture">link</Root.HoloLink>
    {(['sm', 'md', 'lg', 'xl'] as const).map(size => (['circle', 'square'] as const).map(shape => <Root.HoloAvatar key={size + shape} size={size} shape={shape} src="fixture" alt="fixture" fallback="F" className="fixture" />))}
    {(['cyan', 'green', 'error', 'warning'] as const).map(color => <Root.HoloBadge key={color} color={color} count={1} dot={false} overflowCount={9} showZero className="fixture"><span /></Root.HoloBadge>)}
    {(['cyan', 'blue', 'green', 'purple', 'error', 'warning'] as const).map(color => (['sm', 'md'] as const).map(size => <Root.HoloTag key={color + size} color={color} size={size} closable onClose={noop} icon={<span />} className="fixture">tag</Root.HoloTag>))}
    {(['horizontal', 'vertical'] as const).map(layout => <Root.HoloDescriptions key={layout} layout={layout} column={2} items={[{ label: 'Label', value: 'Value' }]} className="fixture" />)}
    <Root.HoloTimeline items={[{ title: 'Title', description: 'Description', time: 'now', color: 'cyan', icon: <span /> }]} className="fixture" />
    <Root.HoloCollapse items={[{ key: 'one', title: 'One', content: 'Content', disabled: false }]} activeKeys={['one']} onChange={() => {}} accordion className="fixture" />
    <Root.HoloEmpty description="empty" icon={<span />} className="fixture"><button /></Root.HoloEmpty><Root.HoloKbd className="fixture">⌘K</Root.HoloKbd>
    {(['click', 'hover'] as const).map(trigger => (['top', 'bottom', 'left', 'right'] as const).map(placement => <Root.HoloPopover key={trigger + placement} trigger={trigger} placement={placement} content="content" open onOpenChange={setBoolean} className="fixture"><button /></Root.HoloPopover>))}
    {(['top', 'bottom', 'left', 'right'] as const).map(placement => <Root.HoloTooltip key={placement} placement={placement} content="content" delay={1} className="fixture"><button /></Root.HoloTooltip>)}
    <Root.HoloTable columns={(['left', 'center', 'right'] as const).map(align => ({ key: align, title: align, align, width: '1rem', render: () => align }))} data={[{ id: 'one' }]} rowKey="id" loading emptyText="empty" className="fixture" />
    <Root.StatusIndicator status="connected" labels={{ connected: 'Online', connecting: 'Connecting', disconnected: 'Offline', error: 'Error' }} colors={{ connected: '#0f0', connecting: '#ff0', disconnected: '#888', error: '#f00' }} />
    {(['sm', 'md', 'lg'] as const).map(size => <Root.HoloCheckbox key={size} size={size} checked onChange={setBoolean} label="label" disabled indeterminate className="fixture" />)}
    {(['sm', 'md', 'lg'] as const).map(size => <Root.HoloDatePicker key={size} size={size} value="2026-01-01" onChange={setString} placeholder="date" disabled className="fixture" />)}
    {(['sm', 'md', 'lg'] as const).map(size => (['default', 'ghost'] as const).map(variant => ([undefined, 'error', 'success'] as const).map(status => <Root.HoloInput key={size + variant + status} size={size} variant={variant} status={status} prefix={<span />} suffix={<span />} grouped disabled readOnly onChange={() => {}} className="fixture" />)))}
    {(['sm', 'md', 'lg'] as const).map(size => (['default', 'ghost'] as const).map(variant => ([undefined, 'error', 'success'] as const).map(status => <Root.HoloTextarea key={size + variant + status} size={size} variant={variant} status={status} autoResize maxAutoHeight={200} onSubmit={noop} grouped disabled onChange={() => {}} className="fixture" />)))}
    {(['sm', 'md', 'lg'] as const).map(size => (['default', 'ghost'] as const).map(variant => ([undefined, 'error', 'success'] as const).map(status => <Root.HoloInputGroup key={size + variant + status} size={size} variant={variant} status={status} disabled className="fixture"><Root.HoloInputAddon className="fixture">@</Root.HoloInputAddon><Root.HoloInput /></Root.HoloInputGroup>)))}
    {(['sm', 'md', 'lg'] as const).map(size => <Root.HoloNumberInput key={size} size={size} value={1} onChange={setNumber} min={0} max={2} step={0.5} precision={1} disabled className="fixture" />)}
    {(['sm', 'md', 'lg'] as const).map(size => <Root.HoloRadio key={size} size={size} checked onChange={setBoolean} label="label" disabled className="fixture" />)}
    {(['horizontal', 'vertical'] as const).map(direction => (['sm', 'md', 'lg'] as const).map(size => <Root.HoloRadioGroup key={direction + size} direction={direction} size={size} options={options} value="one" onChange={setString} className="fixture" />))}
    {(['sm', 'md', 'lg'] as const).map(size => (['default', 'ghost'] as const).map(variant => ([undefined, 'error', 'success'] as const).map(status => <Root.HoloSelect key={size + variant + status} size={size} variant={variant} status={status} options={options} value="one" onChange={setStringOrArray} placeholder="select" disabled multiple searchable className="fixture" />)))}
    {(['sm', 'md', 'lg'] as const).map(size => <Root.HoloSwitch key={size} size={size} checked onChange={setBoolean} label="label" disabled className="fixture" />)}
    <Root.HoloSlider value={50} onChange={setNumber} min={0} max={100} step={5} disabled showValue className="fixture" />
    <Root.HoloUpload accept="image/*" multiple disabled onFiles={() => {}} className="fixture"><span>upload</span></Root.HoloUpload>
    <Root.HoloForm onSubmit={() => {}} className="fixture"><Root.HoloFormItem label="Label" required error="error" helpText="help" className="fixture"><Root.HoloInput /></Root.HoloFormItem></Root.HoloForm>
    {(['info', 'success', 'warning', 'danger'] as const).map(type => (['centered', 'horizontal'] as const).map(layout => <Root.HoloConfirm key={type + layout} open onConfirm={noop} onCancel={noop} title="title" description="description" confirmText="confirm" cancelText="cancel" type={type} layout={layout} maskClosable icon={<span />} className="fixture" />))}
    {(['up', 'down'] as const).map(direction => <Root.DataStreamEffect key={direction} active direction={direction} className="fixture" />)}
    {(['left', 'right'] as const).map(placement => <Root.HoloDrawer key={placement} open onClose={noop} title="drawer" placement={placement} width="20rem" closable maskClosable className="fixture" ariaLabel="drawer">drawer</Root.HoloDrawer>)}
    {(['normal', 'success', 'error'] as const).map(status => (['sm', 'md'] as const).map(size => <Root.HoloProgress key={status + size} percent={42} status={status} size={size} showInfo className="fixture" />))}
    {(['sm', 'md', 'lg'] as const).map(size => <Root.HoloSpinner key={size} size={size} label="loading" className="fixture" />)}
    {(['horizontal', 'vertical'] as const).map(orientation => <Root.HoloDivider key={orientation} orientation={orientation} label="label" className="fixture" />)}
    {(['horizontal', 'vertical'] as const).map(direction => (['sm', 'md', 'lg', 12] as const).map(size => (['start', 'center', 'end'] as const).map(align => <Root.HoloSpace key={direction + size + align} direction={direction} size={size} align={align} wrap className="fixture"><span /></Root.HoloSpace>)))}
    <Root.HoloScrollArea maxHeight={200} className="fixture"><span /></Root.HoloScrollArea>
    <Root.HoloBreadcrumb items={[{ label: 'Home', href: '/', onClick: noop }]} separator="/" className="fixture" />
    <Root.HoloAnchor items={[{ key: 'one', title: 'One', href: '#one' }]} activeKey="one" onChange={setString} className="fixture" />
    {(['click', 'hover'] as const).map(trigger => (['bottomLeft', 'bottomRight'] as const).map(placement => <Root.HoloDropdown key={trigger + placement} trigger={trigger} placement={placement} items={[{ key: 'one', label: 'One', icon: <span />, disabled: false, danger: false, divider: false }]} onSelect={setString} className="fixture"><button /></Root.HoloDropdown>))}
    {(['horizontal', 'vertical'] as const).map(direction => <Root.HoloSteps key={direction} direction={direction} current={1} items={[{ title: 'One', description: 'Description', icon: <span /> }]} className="fixture" />)}
    <Root.HoloPagination current={2} total={100} pageSize={10} onChange={setNumber} showTotal className="fixture" />
    <Root.HoloTab items={[{ key: 'one', label: 'One', icon: <span /> }]} activeKey="one" onChange={setString} className="fixture" />
    <Root.HoloModal open onClose={noop} title="modal" footer={<span />} width="20rem" closable maskClosable className="fixture" ariaLabel="modal">modal</Root.HoloModal>
    <Root.HoloAlert type="info" title="title" description="description" closable onClose={noop} icon={<span />} className="fixture" />
    <Root.HoloSkeleton loading rows={4} avatar title className="fixture"><span /></Root.HoloSkeleton><Root.HexagonLoader size={24} className="fixture" />
    <Root.HtmlPreviewBlock code="<!doctype html><html><body>fixture</body></html>" />
    <Root.HoloPortal container={document.body}><span /></Root.HoloPortal>
    <Root.ThemeProvider {...themeProviderProps}><span /></Root.ThemeProvider>
    <Root.ToastProvider><HookFixture /></Root.ToastProvider>
    <Chat.ChatBubble align="left" streaming timestamp="now" className="fixture">chat</Chat.ChatBubble><Chat.ChatInputArea onSend={setString} disabled /><Chat.ChatMessageList scrollDeps={[1]} isEmpty emptyContent="empty" className="fixture">chat</Chat.ChatMessageList>
    <AI.AIMessageBubble message={message} isStreaming enableCopy actions={<span />} onOpenArtifact={noop} markdownComponents={{ a: (props: React.ComponentProps<'a'>) => <a {...props} data-fixture="markdown-link" /> }} />
    <AI.AIMessageList messages={[message]} streamingContent="stream" streamingThinking="thinking" processing emptyContent="empty" onOpenArtifact={noop} enableCopy renderFileGroup={() => <span />} />
    <AI.AIChatContainer messages={[message]} onSend={setString} processing streamingContent="stream" streamingThinking="thinking" showEmptyState noSessionContent="none" emptyContent="empty" onOpenArtifact={noop} />
    <AI.AITaskExecutionPanel taskList={{ description: 'Release', tasks: [{ id: 'one', description: 'Build', completed: true, files: ['dist'] }] }} defaultExpanded headerMeta="1 call" renderTaskDetails={task => task.files.join(', ')} />
    <AI.AIToolCallCard name="tool" status="complete" arguments="{}" result="{}" durationMs={1} grouped /><AI.AIToolCallGroup messages={[toolMessage]} /><AI.AIToolExecutionCard toolName="tool" status="running" result="result" />
    <AI.ArtifactPreviewDrawer artifact={artifact} onClose={noop} width="50vw" renderers={{ html: () => <span /> }} />
    <Root.MessageBubble message={message} /><Root.MessageList messages={[message]} /><Root.ChatContainer onSend={setString} /><Root.ToolExecutionCard toolName="legacy" status="pending" />
    <Root.LocaleProvider locale={enUS}><Root.LocaleProvider locale={zhCN}><span data-preset={Preset.presetSiliconHolo().name} /></Root.LocaleProvider></Root.LocaleProvider>
  </>
)

export const minimalCompatibilityFixture = (
  <Root.ThemeProvider>
    <Root.LocaleProvider locale={enUS}>
      <Root.ToastProvider>
        <Root.HoloButton>button</Root.HoloButton><Root.HoloLink href="/">link</Root.HoloLink><Root.GlowCard>card</Root.GlowCard><Root.IconButton>icon</Root.IconButton><Root.CircuitBorder>circuit</Root.CircuitBorder>
        <Root.HoloDivider /><Root.HoloSpace><span /></Root.HoloSpace><Root.HoloScrollArea><span /></Root.HoloScrollArea>
        <Root.HoloBreadcrumb items={[]} /><Root.HoloDropdown items={[]}><button /></Root.HoloDropdown><Root.HoloPagination current={1} total={20} onChange={setNumber} /><Root.HoloSteps current={0} items={[]} /><Root.HoloTab items={[]} activeKey="" onChange={setString} /><Root.HoloAnchor items={[]} />
        <Root.HoloInput /><Root.HoloTextarea /><Root.HoloInputGroup><Root.HoloInput /></Root.HoloInputGroup><Root.HoloInputAddon>addon</Root.HoloInputAddon><Root.HoloSelect options={[]} value="" onChange={setStringOrArray} /><Root.HoloCheckbox onChange={setBoolean} /><Root.HoloRadio onChange={setBoolean} /><Root.HoloRadioGroup options={[]} value="" onChange={setString} /><Root.HoloSwitch checked={false} onChange={setBoolean} /><Root.HoloSlider value={0} onChange={setNumber} /><Root.HoloNumberInput value={0} onChange={setNumber} /><Root.HoloDatePicker onChange={setString} /><Root.HoloUpload onFiles={() => {}} /><Root.HoloForm onSubmit={() => {}}><span /></Root.HoloForm><Root.HoloFormItem><span /></Root.HoloFormItem>
        <Root.HoloTable columns={[]} data={[]} rowKey="id" /><Root.HoloTag>tag</Root.HoloTag><Root.HoloBadge><span /></Root.HoloBadge><Root.HoloAvatar /><Root.HoloDescriptions items={[]} /><Root.HoloTimeline items={[]} /><Root.HoloCollapse items={[]} /><Root.HoloTooltip content="tip"><span /></Root.HoloTooltip><Root.HoloPopover content="popover"><span /></Root.HoloPopover><Root.HoloEmpty /><Root.HoloKbd>key</Root.HoloKbd><Root.StatusIndicator status="connected" /><Root.CodeBlock />
        <Root.HoloModal open={false} onClose={noop}>modal</Root.HoloModal><Root.HoloConfirm open={false} onConfirm={noop} onCancel={noop} title="confirm" /><Root.HoloDrawer open={false} onClose={noop}>drawer</Root.HoloDrawer><Root.HoloAlert type="info" /><Root.HoloProgress percent={0} /><Root.HoloSkeleton loading={false}><span /></Root.HoloSkeleton><Root.HoloSpinner /><Root.HexagonLoader /><Root.DataStreamEffect active={false} />
        <Chat.ChatBubble align="left">chat</Chat.ChatBubble><Chat.ChatInputArea onSend={setString} /><Chat.ChatMessageList>chat</Chat.ChatMessageList>
        <AI.AIMessageBubble message={message} /><AI.AIMessageList messages={[]} /><AI.AIChatContainer onSend={setString} /><AI.AITaskExecutionPanel taskList={{ description: 'Tasks', tasks: [] }} /><AI.AIToolCallCard name="tool" status="pending" /><AI.AIToolCallGroup messages={[]} /><AI.AIToolExecutionCard toolName="tool" status="pending" /><AI.ArtifactPreviewDrawer artifact={null} onClose={noop} />
        <Root.MessageBubble message={message} /><Root.MessageList messages={[]} /><Root.ChatContainer onSend={setString} /><Root.ToolExecutionCard toolName="tool" status="pending" /><Root.HoloPortal><span /></Root.HoloPortal><HookFixture />
      </Root.ToastProvider>
    </Root.LocaleProvider>
  </Root.ThemeProvider>
)
`)
  writeFileSync(join(consumerDirectory, 'verify-exports.mjs'), `
const expected = ${JSON.stringify(expectedPublicExports)}
for (const [specifier, names] of Object.entries(expected)) {
  const entry = await import(specifier)
  const actual = Object.keys(entry).sort()
  const required = [...names].sort()
  if (JSON.stringify(actual) !== JSON.stringify(required)) {
    throw new Error(specifier + ' export baseline changed. Expected ' + required.join(', ') + '; received ' + actual.join(', '))
  }
}
console.log('public export baselines verified')
`)

  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--no-package-lock'], consumerDirectory)
  const installedPresetTypes = readFileSync(join(consumerDirectory, 'node_modules/silicon-holo-design/dist/preset/index.d.ts'), 'utf8')
  if (/from ["']unocss["']/.test(installedPresetTypes)) throw new Error('package declarations must not require UnoCSS for ordinary consumers')
  run('node', ['verify-exports.mjs'], consumerDirectory)
  run(join(consumerDirectory, 'node_modules/.bin/tsc'), ['--noEmit'], consumerDirectory)
  run(join(consumerDirectory, 'node_modules/.bin/vite'), ['build', '--config', 'vite.styles.config.ts'], consumerDirectory)

  const builtHtml = readFileSync(join(consumerDirectory, 'dist/index.html'), 'utf8')
  if (!builtHtml.includes('/assets/')) throw new Error('consumer Vite build did not emit assets')
  const stylesOnlyCss = globSync('dist/assets/*.css', { cwd: consumerDirectory, absolute: true }).map(file => readFileSync(file, 'utf8')).join('\n')
  for (const value of ['--shd-surface-base:', '--shd-surface-inset:', '--shd-content-on-accent:', '.shd-spectral-glass{', '.shd-surface-inset{', '.shd-control-focus:focus-visible', '.bg-surface-raised{', '.border-stroke-accent{', '.text-content-on-accent{', '.focus-visible\\:ring-focus:focus-visible{', '@media(prefers-reduced-motion:reduce)']) {
    if (!stylesOnlyCss.includes(value)) throw new Error(`clean styles-only consumer did not include ${value}`)
  }

  writeFileSync(join(consumerDirectory, 'index.html'), '<div id="root"></div><script type="module" src="/src/preset-only.tsx"></script>')
  run(join(consumerDirectory, 'node_modules/.bin/vite'), ['build', '--config', 'vite.preset.config.ts', '--outDir', 'dist-preset', '--emptyOutDir'], consumerDirectory)
  const presetCss = globSync('dist-preset/assets/*.css', { cwd: consumerDirectory, absolute: true }).map(file => readFileSync(file, 'utf8')).join('\n')
  if (!/\.border(?:,[^{]+)?\{[^}]*border-style:solid/.test(presetCss)) throw new Error('clean preset consumer did not generate scoped border utility styles')
  for (const rule of [/\.border-t\{[^}]*border-width:1px 0 0/, /\.border-r\{[^}]*border-width:0 1px 0 0/, /\.border-b\{[^}]*border-width:0 0 1px/, /\.border-l\{[^}]*border-width:0 0 0 1px/]) {
    if (!rule.test(presetCss)) throw new Error('clean preset consumer did not generate self-contained directional border utilities')
  }
  if (!/button\.shd-control-focus(?:,[^{]+)?\{[^}]*appearance:none/.test(presetCss)) throw new Error('clean preset consumer did not generate the scoped control reset')
  if (!/button\.shd-local-focus\{[^}]*background-color:transparent[^}]*color:inherit/.test(presetCss)) throw new Error('clean preset consumer did not generate the local control material reset')
  if (/(?:^|})button\{[^}]*(?:appearance:none|border-width:0|background:none)/.test(presetCss)) throw new Error('clean preset consumer reset host buttons globally')
  for (const selector of ['.shd-spectral-panel-raised{', '.shd-spectral-glass{', '.shd-surface-inset{', '.shd-z-overlay{', '.shd-z-toast{', '.shd-z-tooltip{', 'button.shd-button{', 'button.shd-button-md{', 'button.shd-segmented-control-button{', '.shd-copy-action{', '.shd-scrollbar{', '.shd-markdown-content{', '.shd-markdown-table-wrap{', '.shd-local-focus:focus-visible{', '.shd-control-focus:focus-visible', '.flex-center{', '.shd-focus-ring:focus-visible{', '.bg-surface-raised{', '.border-stroke-accent{', '.text-content-on-accent{', '.bg-state-warning-soft{']) {
    if (!presetCss.includes(selector)) throw new Error(`clean preset consumer did not generate ${selector}`)
  }
  for (const selector of ['.shd-spectral-panel-raised{', '.shd-spectral-glass{', '.shd-surface-inset{']) {
    const start = presetCss.indexOf(selector)
    const rule = presetCss.slice(start, presetCss.indexOf('}', start) + 1)
    if (!rule.includes('color:var(--shd-content-primary)')) throw new Error(`clean preset consumer ${selector} lacks semantic foreground`)
  }
  console.log('✓ npm tarball installs, resolves all public types, imports styles, and builds in a clean Vite consumer')
} finally {
  rmSync(workspace, { recursive: true, force: true })
}
