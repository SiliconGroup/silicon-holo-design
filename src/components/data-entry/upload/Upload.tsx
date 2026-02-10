import { useRef, useState, type ReactNode, type DragEvent } from 'react'
import { useLocale } from '@/locale'

interface HoloUploadProps {
  accept?: string
  multiple?: boolean
  disabled?: boolean
  onFiles: (files: File[]) => void
  children?: ReactNode
  className?: string
}

export function HoloUpload({
  accept,
  multiple = false,
  disabled = false,
  onFiles,
  children,
  className = '',
}: HoloUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const locale = useLocale()

  const handleFiles = (files: FileList | null) => {
    if (!files || disabled) return
    const fileArray = Array.from(files)
    onFiles(fileArray)
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(false)
      handleFiles(e.dataTransfer.files)
    }
  }

  const defaultContent = (
    <div className="flex flex-col items-center gap-2">
      <svg className="w-8 h-8 text-holo-cyan/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <div className="text-sm text-white/70">{locale.upload.dragText}</div>
    </div>
  )

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        transition-colors duration-200
        ${isDragOver
          ? 'border-holo-cyan/50 bg-holo-cyan/5'
          : 'border-holo-cyan/25 hover:border-holo-cyan/40'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {children || defaultContent}
    </div>
  )
}