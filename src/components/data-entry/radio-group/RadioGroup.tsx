import { HoloRadio } from '@/components/data-entry/radio'

interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

interface HoloRadioGroupProps {
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  direction?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function HoloRadioGroup({
  options,
  value,
  onChange,
  direction = 'vertical',
  size = 'md',
  className = '',
}: HoloRadioGroupProps) {
  return (
    <div
      className={`
        flex gap-3
        ${direction === 'horizontal' ? 'flex-row' : 'flex-col'}
        ${className}
      `}
      role="radiogroup"
    >
      {options.map((option) => (
        <HoloRadio
          key={option.value}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          label={option.label}
          disabled={option.disabled}
          size={size}
        />
      ))}
    </div>
  )
}