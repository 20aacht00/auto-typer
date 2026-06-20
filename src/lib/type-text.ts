/**
 * Real keyboard-typing engine.
 *
 * Simulates a human typing text character-by-character by dispatching the
 * full keyboard event sequence (keydown -> input -> keyup) for every char.
 *
 * This bypasses paste-blocking on sites that listen for the `paste` event
 * and call preventDefault(), because we never fire a paste event — we only
 * emit individual keystrokes that look exactly like a real keyboard.
 */

export interface TypeOptions {
  /** Delay between characters in milliseconds. 0 = maximum speed. */
  charDelayMs?: number
  /** Called with progress (0..1) after each character. */
  onProgress?: (ratio: number) => void
}

export interface TypeResult {
  error?: string
  typed: number
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function getNativeValueSetter(
  el: HTMLInputElement | HTMLTextAreaElement
): ((v: string) => void) | undefined {
  const proto = el instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype
  return Object.getOwnPropertyDescriptor(proto, "value")?.set
}

function fireKeyboardEvents(
  el: EventTarget,
  type: "keydown" | "keyup",
  char: string
): void {
  const code = char.charCodeAt(0)
  el.dispatchEvent(
    new KeyboardEvent(type, {
      key: char,
      code: code <= 90 ? `Key${char.toUpperCase()}` : `Digit${char}`,
      keyCode: code,
      charCode: code,
      bubbles: true,
      cancelable: true
    })
  )
}

/** Append a single character to an <input>/<textarea>, respecting caret. */
function appendCharToInput(
  el: HTMLInputElement | HTMLTextAreaElement,
  char: string
): void {
  const setter = getNativeValueSetter(el)
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? el.value.length

  const newValue = el.value.slice(0, start) + char + el.value.slice(end)
  if (setter) {
    setter.call(el, newValue)
  } else {
    el.value = newValue
  }

  const pos = start + char.length
  try {
    el.setSelectionRange(pos, pos)
  } catch {
    // setSelectionRange not supported on some input types
  }
  el.dispatchEvent(new Event("input", { bubbles: true }))
}

/** Type a single character into a contentEditable element. */
function appendCharToContentEditable(el: HTMLElement, char: string): void {
  // execCommand insertText emits beforeinput + input and preserves undo.
  // It is the closest thing to a real keystroke for rich-text editors.
  if (document.execCommand("insertText", false, char)) {
    return
  }

  // Fallback: mutate the selection range manually.
  const sel = window.getSelection()
  if (sel && sel.rangeCount) {
    const range = sel.getRangeAt(0)
    range.deleteContents()
    range.insertNode(document.createTextNode(char))
    range.collapse(false)
    sel.removeAllRanges()
    sel.addRange(range)
  } else {
    el.textContent = (el.textContent ?? "") + char
  }
  el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: char }))
}

async function typeChar(el: HTMLElement, char: string): Promise<void> {
  fireKeyboardEvents(el, "keydown", char)

  // legacy keypress — some frameworks still rely on it
  el.dispatchEvent(
    new KeyboardEvent("keypress", {
      key: char,
      bubbles: true,
      cancelable: true
    })
  )

  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    appendCharToInput(el, char)
  } else {
    appendCharToContentEditable(el, char)
  }

  fireKeyboardEvents(el, "keyup", char)
}

/**
 * Type the full text into a target element, character by character.
 * Returns how many characters were typed and an error if any.
 */
export async function typeText(
  target: Element | null | undefined,
  text: string,
  options: TypeOptions = {}
): Promise<TypeResult> {
  if (!text) return { typed: 0, error: "متنی برای تایپ وجود ندارد." }
  if (!target) return { typed: 0, error: "هیچ فیلدی انتخاب نشده است." }

  const el = target as HTMLElement
  const delay = options.charDelayMs ?? 0

  // Verify the element is editable.
  const isInput =
    el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
  if (!isInput && !el.isContentEditable) {
    return { typed: 0, error: "این عنصر قابل ویرایش نیست." }
  }

  el.focus({ preventScroll: true })

  const total = text.length
  let typed = 0

  try {
    for (let i = 0; i < total; i++) {
      const char = text[i]

      await typeChar(el, char)
      typed++

      if (options.onProgress && (i % 10 === 0 || i === total - 1)) {
        options.onProgress((i + 1) / total)
      }

      if (delay > 0) {
        await sleep(delay)
      } else if (i % 64 === 63) {
        // At max speed, yield occasionally so the UI doesn't freeze
        // on very long text. ~64 chars per microtask batch.
        await sleep(0)
      }
    }
  } catch (err) {
    return { typed, error: `خطا هنگام تایپ: ${(err as Error).message}` }
  }

  return { typed }
}
