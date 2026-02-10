import { useState } from 'react'
import { ComponentDemo } from '../ComponentDemo'
import {
  HoloButton,
  HoloInput,
  HoloTextarea,
  HoloSelect,
  HoloCheckbox,
  HoloRadioGroup,
  HoloSwitch,
  HoloSlider,
  HoloNumberInput,
  HoloUpload,
  HoloDatePicker,
  HoloForm,
  HoloFormItem,
  HoloSpace
} from '@/index'

export default function FormSection() {
  const [checked, setChecked] = useState(false)
  const [indeterminate, setIndeterminate] = useState(true)
  const [checkedSm, setCheckedSm] = useState(false)
  const [checkedLg, setCheckedLg] = useState(false)
  const [radioValue, setRadioValue] = useState('react')
  const [radioValue2, setRadioValue2] = useState('vue')
  const [switchOn, setSwitchOn] = useState(false)
  const [switchSm, setSwitchSm] = useState(false)
  const [switchLg, setSwitchLg] = useState(false)
  const [sliderValue, setSliderValue] = useState(50)
  const [numberValue, setNumberValue] = useState(10)
  const [selectValue, setSelectValue] = useState('')
  const [multiSelect, setMultiSelect] = useState<string[]>([])
  const [date, setDate] = useState('')

  const selectOptions = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'solid', label: 'Solid' }
  ]

  const radioOptions = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' }
  ]

  const handleSelectChange = (value: string | string[]) => {
    if (typeof value === 'string') {
      setSelectValue(value)
    }
  }

  const handleMultiSelectChange = (value: string | string[]) => {
    if (Array.isArray(value)) {
      setMultiSelect(value)
    }
  }

  return (
    <div className="space-y-8">
      <ComponentDemo id="button" title="HoloButton" description="Interactive buttons with variants, sizes, and states">
        <div className="flex flex-wrap gap-4 items-center">
          <HoloButton variant="primary">Primary</HoloButton>
          <HoloButton variant="secondary">Secondary</HoloButton>
          <HoloButton variant="ghost">Ghost</HoloButton>
          <HoloButton size="sm">Small</HoloButton>
          <HoloButton size="md">Medium</HoloButton>
          <HoloButton size="lg">Large</HoloButton>
          <HoloButton disabled>Disabled</HoloButton>
          <HoloButton icon={<span className="i-carbon-search w-4 h-4 inline-block" />}>With Icon</HoloButton>
          <HoloButton variant="success">Success</HoloButton>
          <HoloButton variant="warning">Warning</HoloButton>
          <HoloButton variant="danger">Danger</HoloButton>
        </div>
      </ComponentDemo>

      <ComponentDemo id="input" title="HoloInput" description="Text inputs with variants, sizes, and status states">
        <div className="flex flex-col gap-4">
          <HoloInput placeholder="Default input" />
          <HoloInput variant="ghost" placeholder="Ghost variant" />
          <HoloInput size="sm" placeholder="Small size" />
          <HoloInput 
            prefix={<span className="i-carbon-search" />}
            placeholder="With prefix"
          />
          <HoloInput 
            suffix={<span className="i-carbon-close" />}
            placeholder="With suffix"
          />
          <HoloInput status="error" placeholder="Error status" />
          <HoloInput status="success" placeholder="Success status" />
        </div>
      </ComponentDemo>

      <ComponentDemo id="textarea" title="HoloTextarea" description="Multi-line text inputs">
        <div className="flex flex-col gap-4">
          <HoloTextarea placeholder="Basic textarea" />
          <HoloTextarea autoResize placeholder="Auto-resize textarea" />
        </div>
      </ComponentDemo>

      <ComponentDemo id="select" title="HoloSelect" description="Dropdown selection with multiple modes">
        <div className="flex flex-col gap-4">
          <HoloSelect
            options={selectOptions}
            value={selectValue}
            onChange={handleSelectChange}
            placeholder="Basic select"
          />
          <HoloSelect
            options={selectOptions}
            value={multiSelect}
            onChange={handleMultiSelectChange}
            multiple
            placeholder="Multiple select"
          />
          <HoloSelect
            options={selectOptions}
            value={selectValue}
            onChange={handleSelectChange}
            searchable
            placeholder="Searchable select"
          />
        </div>
      </ComponentDemo>

      <ComponentDemo id="checkbox" title="HoloCheckbox" description="Checkboxes with different states and sizes">
        <div className="flex flex-wrap gap-4 items-center">
          <HoloCheckbox checked={checked} onChange={setChecked} label="Basic checkbox" />
          <HoloCheckbox indeterminate={indeterminate} onChange={() => setIndeterminate(!indeterminate)} label="Indeterminate" />
          <HoloCheckbox disabled label="Disabled" onChange={() => {}} />
          <HoloCheckbox size="sm" checked={checkedSm} onChange={setCheckedSm} label="Small" />
          <HoloCheckbox size="lg" checked={checkedLg} onChange={setCheckedLg} label="Large" />
        </div>
      </ComponentDemo>

      <ComponentDemo id="radio" title="HoloRadioGroup" description="Radio button groups with different orientations">
        <div className="flex flex-col gap-4">
          <HoloRadioGroup
            options={radioOptions}
            value={radioValue}
            onChange={setRadioValue}
            direction="horizontal"
          />
          <HoloRadioGroup
            options={radioOptions}
            value={radioValue2}
            onChange={setRadioValue2}
            direction="vertical"
          />
        </div>
      </ComponentDemo>

      <ComponentDemo id="switch" title="HoloSwitch" description="Toggle switches with labels and states">
        <div className="flex flex-wrap gap-4 items-center">
          <HoloSwitch checked={switchOn} onChange={setSwitchOn} label="Basic switch" />
          <HoloSwitch size="sm" label="Small" checked={switchSm} onChange={setSwitchSm} />
          <HoloSwitch size="lg" label="Large" checked={switchLg} onChange={setSwitchLg} />
          <HoloSwitch disabled label="Disabled" checked={false} onChange={() => {}} />
        </div>
      </ComponentDemo>

      <ComponentDemo id="slider" title="HoloSlider" description="Range sliders with value display">
        <div className="flex flex-col gap-4">
          <HoloSlider
            value={sliderValue}
            onChange={setSliderValue}
            showValue
          />
          <HoloSlider disabled value={25} onChange={() => {}} />
        </div>
      </ComponentDemo>

      <ComponentDemo id="number-input" title="HoloNumberInput" description="Numeric inputs with constraints">
        <div className="flex flex-col gap-4">
          <HoloNumberInput
            value={numberValue}
            onChange={setNumberValue}
          />
          <HoloNumberInput
            value={50}
            onChange={() => {}}
            min={0}
            max={100}
            step={5}
          />
        </div>
      </ComponentDemo>

      <ComponentDemo id="upload" title="HoloUpload" description="File upload with drag and drop">
        <HoloUpload onFiles={(files) => console.log('Files uploaded:', files)} />
      </ComponentDemo>

      <ComponentDemo id="date-picker" title="HoloDatePicker" description="Date selection input">
        <HoloDatePicker
          value={date}
          onChange={setDate}
          placeholder="Select date"
        />
      </ComponentDemo>

      <ComponentDemo id="form" title="HoloForm" description="Complete form with validation">
        <HoloForm onSubmit={(data) => console.log('Form submitted:', data)}>
          <HoloFormItem label="Username" required>
            <HoloInput placeholder="Enter username" />
          </HoloFormItem>
          <HoloFormItem label="Email" error="Invalid email format">
            <HoloInput placeholder="Enter email" status="error" />
          </HoloFormItem>
          <HoloFormItem label="Bio" helpText="Tell us about yourself">
            <HoloTextarea placeholder="Enter bio" />
          </HoloFormItem>
          <HoloSpace>
            <HoloButton variant="primary">Submit</HoloButton>
            <HoloButton variant="ghost">Cancel</HoloButton>
          </HoloSpace>
        </HoloForm>
      </ComponentDemo>
    </div>
  )
}