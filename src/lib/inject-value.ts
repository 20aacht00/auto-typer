/**
 * Core injection logic: sets a value into any editable element while keeping
 * modern frameworks (React, Angular, Vue, Svelte) in sync.
 *
 * The naive `el.value = x` does NOT notify React/Angular, because they track
 * values through their own synthetic event handlers that listen for `input`.
 * We bypass the framework's wrapper by using the native prototype setter,
 * then dispatch the events they listen for.
 */

type EditableElement = HTMLInputElement | HTMLTextAreaElement | HTMLElement

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])

export function isEditable(el: Element | null | undefined): el is EditableElement {
  if (!el) return false
  if (el instanceof HTMLInputElement) {
    const nonTextTypes = ["button", "submit", "reset", "checkbox", "radio", "file", "image"]
    return !nonTextTypes.includes((el as HTMLInputElement).type.toLowerCase())
  }
  if (el instanceof HTMLTextAreaElement) return true
  if (el instanceof HTMLElement) {
    return el.isContentEditable
  }
  return false
}

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const proto = el instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype

  const type = (el as HTMLInputElement).type
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value")
    ?? Object.getOwnPropertyDescriptor(proto, "checked")

  if (descriptor?.set) {
    // React tracks whether it has overridden value; using the native setter
    // combined with dispatching an `input` event resets React's state.
    descriptor.set.call(el, type === "checkbox" || type === "radio" ? (value as any) : value)
  } else {
    ;(el as any).value = value
  }
}

function dispatchEvents(el: EventTarget): void {
  // React listens to `input` on modern browsers via the beforeinput event,
  // but `input` remains the most broadly compatible trigger.
  el.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }))
  el.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }))
  el.dispatchEvent(new Event("blur", { bubbles: true, cancelable: true }))
}

function injectIntoInputOrTextarea(
  el: HTMLInputElement | HTMLTextAreaElement,
  text: string
): void {
  el.focus({ preventScroll: true })
  setNativeValue(el, text)
  dispatchEvents(el)
}

function injectIntoContentEditable(el: HTMLElement, text: string): void {
  el.focus({ preventScroll: true })

  // Prefer execCommand insertText - it preserves undo history and is the
  // most compatible approach for rich-text editors (Gmail, Slack, etc.).
  // Although deprecated, it's still the most reliable cross-framework method.
  const selection = window.getSelection()
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null

  if (document.execCommand("insertText", false, text)) {
    return
  }

  // Fallback: replace content directly and fire input event.
  if (range && selection) {
    range.deleteContents()
    range.insertNode(document.createTextNode(text))
    selection.removeAllRanges()
    selection.addRange(range)
  } else {
    el.textContent = text
  }
  dispatchEvents(el)
}

/**
 * Public entry point. Returns an error string if injection failed, otherwise
 * undefined on success.
 */
export function injectText(target: Element | null | undefined, text: string): string | undefined {
  if (!text) return "متنی برای درج وجود ندارد."
  if (!target) return "هیچ فیلدی انتخاب نشده است."

  if (!isEditable(target)) {
    return "این عنصر قابل ویرایش نیست."
  }

  try {
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      injectIntoInputOrTextarea(target, text)
    } else if (target.isContentEditable) {
      injectIntoContentEditable(target, text)
    } else if (INPUT_TAGS.has(target.tagName)) {
      // SELECT or unknown input - best effort
      ;(target as any).value = text
      dispatchEvents(target)
    } else {
      return "نوع فیلد پشتیبانی نمی‌شود."
    }
    return undefined
  } catch (err) {
    return `خطا هنگام درج: ${(err as Error).message}`
  }
}
