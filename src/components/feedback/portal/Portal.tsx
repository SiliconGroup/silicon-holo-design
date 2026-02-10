import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface HoloPortalProps {
  children: ReactNode
  container?: HTMLElement
}

export function HoloPortal({ children, container }: HoloPortalProps) {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const node = container || document.createElement('div')
    if (!container) {
      document.body.appendChild(node)
    }
    setMountNode(node)

    return () => {
      if (!container && node.parentNode) {
        node.parentNode.removeChild(node)
      }
    }
  }, [container])

  return mountNode ? createPortal(children, mountNode) : null
}