import { type ChangeEvent } from 'react'

interface HoloSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showValue?: boolean
  className?: string
}

export function HoloSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = false,
  className = '',
}: HoloSliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <style>{`
        .holo-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 16px; height: 16px; border-radius: 9999px;
          background: #00ffff; border: 2px solid #00ffff;
          box-shadow: 0 0 8px rgba(0,255,255,0.5); cursor: pointer;
        }
        .holo-slider::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 9999px;
          background: #00ffff; border: none;
          box-shadow: 0 0 8px rgba(0,255,255,0.5); cursor: pointer;
        }
      `}</style>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
        className="holo-slider w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: `linear-gradient(to right, rgba(0,255,255,0.4) ${pct}%, rgba(255,255,255,0.1) ${pct}%)`
        }}
      />
      {showValue && (
        <span className="text-xs text-holo-cyan font-mono min-w-8 text-right">{value}</span>
      )}
    </div>
  )
}
