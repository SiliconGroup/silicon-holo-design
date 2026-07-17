import { describe, expect, it } from 'vitest'
import { getFocusableElements } from './focus'

describe('getFocusableElements', () => {
  it('includes summary and the first legend controls while excluding disabled fieldset descendants', () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <details><summary>Summary</summary><p>Details</p></details>
      <fieldset disabled>
        <legend><button>Legend action</button></legend>
        <button>Disabled action</button>
      </fieldset>
    `
    document.body.appendChild(container)
    expect(getFocusableElements(container).map(element => element.textContent?.trim())).toEqual(['Summary', 'Legend action'])
    container.remove()
  })

  it('includes editable hosts and controlled media but excludes explicit negative tabindex and uncontrolled media', () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <div contenteditable>Editable</div>
      <div contenteditable="plaintext-only">Plain text</div>
      <div contenteditable="false">Not editable</div>
      <audio controls></audio>
      <audio></audio>
      <video controls></video>
      <video></video>
      <button tabindex="-1">Programmatic only</button>
    `
    document.body.appendChild(container)
    expect(getFocusableElements(container).map(element => element.tagName + ':' + (element.textContent?.trim() || element.getAttribute('controls')))).toEqual([
      'DIV:Editable',
      'DIV:Plain text',
      'AUDIO:',
      'VIDEO:',
    ])
    container.remove()
  })
})
