import { useId, type ReactNode } from 'react'

interface ChatBubbleProps {
  /** 气泡对齐方向 */
  align: 'left' | 'right'
  /** 是否正在流式输出 */
  streaming?: boolean
  /** 时间戳文本（已格式化） */
  timestamp?: string
  /** 气泡内容 */
  children: ReactNode
  className?: string
}

/** 角落电路装饰 SVG */
function CornerCircuit({ isRight }: { isRight: boolean }) {
  const color = isRight ? 'var(--holo-cyan)' : 'var(--holo-blue, #0088ff)'
  return (
    <svg
      className={`absolute ${isRight ? 'bottom-0 right-0' : 'top-0 left-0'} w-8 h-8 pointer-events-none`}
      viewBox="0 0 32 32"
    >
      {isRight ? (
        <>
          <path d="M32,32 L32,20 L28,20 L28,28 L20,28 L20,32 Z" fill={color} fillOpacity="0.08" />
          <path d="M32,24 L28,24 L28,28 L24,28" fill="none" stroke={color} strokeOpacity="0.2" strokeWidth="0.5" />
          <circle cx="28" cy="28" r="1" fill={color} fillOpacity="0.3" />
        </>
      ) : (
        <>
          <path d="M0,0 L0,12 L4,12 L4,4 L12,4 L12,0 Z" fill={color} fillOpacity="0.08" />
          <path d="M0,8 L4,8 L4,4 L8,4" fill="none" stroke={color} strokeOpacity="0.2" strokeWidth="0.5" />
          <circle cx="4" cy="4" r="1" fill={color} fillOpacity="0.3" />
        </>
      )}
    </svg>
  )
}

/** 气泡内部背景网格纹理 */
function BubbleGrid({ id, isRight }: { id: string; isRight: boolean }) {
  const color = isRight ? 'rgba(0,255,255,' : 'rgba(0,136,255,'
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24,0 L0,0 L0,24" fill="none" stroke={`${color}0.04)`} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

export function ChatBubble({ align, streaming, timestamp, children, className }: ChatBubbleProps) {
  const gridId = useId()
  const isRight = align === 'right'

  return (
    <div className={`flex ${isRight ? 'justify-end' : 'justify-start'} my-4`}>
      <div
        className={`
          relative max-w-[75%] rounded-md overflow-hidden backdrop-blur-md border
          ${isRight ? 'bg-holo-cyan/8 border-holo-cyan/20' : 'bg-holo-blue/6 border-holo-blue/15'}
          ${streaming ? 'shadow-[0_0_20px_rgba(0,136,255,0.15)]' : ''}
          ${className ?? ''}
        `}
      >
        <BubbleGrid id={gridId} isRight={isRight} />

        {/* 顶部光线 */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: isRight
              ? 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.4), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(0, 136, 255, 0.3), transparent)',
          }}
        />

        <CornerCircuit isRight={isRight} />

        {/* 内容 */}
        <div className="relative px-4 py-3">{children}</div>

        {/* 时间戳 */}
        {timestamp && (
          <div className="relative px-4 pb-2 flex items-center gap-2">
            <div className={`flex-1 h-[1px] bg-gradient-to-r from-transparent ${isRight ? 'via-holo-cyan/15' : 'via-holo-blue/12'} to-transparent`} />
            <span className={`text-[10px] font-mono ${isRight ? 'text-holo-cyan/50' : 'text-holo-blue/45'}`}>{timestamp}</span>
            <div className={`flex-1 h-[1px] bg-gradient-to-r from-transparent ${isRight ? 'via-holo-cyan/15' : 'via-holo-blue/12'} to-transparent`} />
          </div>
        )}

        {/* 流式动画 - 使用全局 animations.css 中的 shimmer keyframes */}
        {streaming && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-transparent via-holo-blue to-transparent"
              style={{ animation: 'shimmer 1.5s infinite', width: '50%' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
