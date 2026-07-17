const focusableSelector = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  'summary',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function isDisabledByFieldset(element: HTMLElement) {
  let fieldset = element.closest('fieldset[disabled]') as HTMLFieldSetElement | null
  while (fieldset) {
    const firstLegend = Array.from(fieldset.children).find(child => child.tagName === 'LEGEND')
    if (!firstLegend?.contains(element)) return true
    fieldset = fieldset.parentElement?.closest('fieldset[disabled]') as HTMLFieldSetElement | null
  }
  return false
}

function isVisible(element: HTMLElement) {
  if (element.getAttribute('tabindex') === '-1') return false
  if (element.hidden || element.closest('[hidden], [inert], [aria-hidden="true"]')) return false
  if ('disabled' in element && element.disabled === true) return false
  if (isDisabledByFieldset(element)) return false
  let current: HTMLElement | null = element
  while (current) {
    const style = window.getComputedStyle(current)
    if (style.display === 'none' || style.visibility === 'hidden') return false
    current = current.parentElement
  }
  return true
}

export function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(isVisible)
}

export function focusFirstOrContainer(container: HTMLElement) {
  const [first] = getFocusableElements(container)
  ;(first ?? container).focus()
}

export function trapFocus(event: KeyboardEvent, container: HTMLElement) {
  if (event.key !== 'Tab') return

  const focusable = getFocusableElements(container)
  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (!first || !last) {
    event.preventDefault()
    container.focus()
    return
  }

  if (!container.contains(document.activeElement)) {
    event.preventDefault()
    ;(event.shiftKey ? last : first).focus()
    return
  }

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

export function restoreFocus(element: HTMLElement | null) {
  if (element?.isConnected) element.focus()
}
