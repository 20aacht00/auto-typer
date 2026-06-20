/**
 * Picker overlay: when activated, darkens the page and highlights any
 * editable element on hover. Clicking the highlighted element injects the
 * text into it. Pressing Escape or right-click cancels picker mode.
 *
 * Self-contained: creates and removes its own DOM/CSS so it doesn't depend
 * on the page's stylesheets.
 */

import { isEditable } from "@lib/inject-value"

const OVERLAY_ID = "auto-typer-picker-root"
const HIGHLIGHT_ID = "auto-typer-picker-highlight"
const STYLES_ID = "auto-typer-picker-styles"

const HIGHLIGHT_COLOR = "rgba(99, 102, 241, 0.35)"
const HIGHLIGHT_BORDER = "2px solid rgb(79, 70, 229)"

export interface PickerCallbacks {
  text: string
  onSelect: (element: Element) => void
  onClose: () => void
}

let activeCallbacks: PickerCallbacks | null = null
let hovered: Element | null = null

let mouseMoveHandler: ((e: MouseEvent) => void) | null = null
let clickHandler: ((e: MouseEvent) => void) | null = null
let keyHandler: ((e: KeyboardEvent) => void) | null = null
let contextMenuHandler: ((e: MouseEvent) => void) | null = null

// Saved page state to restore after picker closes, preventing the overlay
// or focus() from shifting the page's scroll position (incl. horizontal).
let pickerActive = false
let savedScrollX = 0
let savedScrollY = 0
let prevHtmlOverflow = ""
let prevBodyOverflow = ""

function injectStyles(): void {
  if (document.getElementById(STYLES_ID)) return
  const style = document.createElement("style")
  style.id = STYLES_ID
  style.textContent = `
    #${OVERLAY_ID} {
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      background: rgba(15, 23, 42, 0.45);
      cursor: crosshair;
      pointer-events: auto;
    }
    #${OVERLAY_ID}::before {
      content: "انتخاب فیلد هدف — کلیک کنید یا ESC برای لغو";
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 16px;
      background: rgb(79, 70, 229);
      color: #fff;
      font: 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      pointer-events: none;
      white-space: nowrap;
      direction: rtl;
    }
    #${HIGHLIGHT_ID} {
      position: fixed;
      z-index: 2147483647;
      pointer-events: none;
      background: ${HIGHLIGHT_COLOR};
      border: ${HIGHLIGHT_BORDER};
      border-radius: 4px;
      box-sizing: border-box;
      transition: all 60ms ease-out;
    }
  `
  document.documentElement.appendChild(style)
}

function removeStyles(): void {
  document.getElementById(STYLES_ID)?.remove()
}

function positionHighlight(rect: DOMRect): void {
  const hl = document.getElementById(HIGHLIGHT_ID)
  if (!hl) return
  hl.style.top = `${rect.top}px`
  hl.style.left = `${rect.left}px`
  hl.style.width = `${rect.width}px`
  hl.style.height = `${rect.height}px`
  hl.style.display = "block"
}

function hideHighlight(): void {
  const hl = document.getElementById(HIGHLIGHT_ID)
  if (hl) hl.style.display = "none"
}

function ensureHighlightElement(): HTMLElement {
  let el = document.getElementById(HIGHLIGHT_ID) as HTMLElement | null
  if (!el) {
    el = document.createElement("div")
    el.id = HIGHLIGHT_ID
    document.documentElement.appendChild(el)
  }
  return el
}

export function createPicker(callbacks: PickerCallbacks): void {
  if (activeCallbacks) {
    destroyPicker()
  }
  activeCallbacks = callbacks
  hovered = null

  // Lock page scroll so the overlay/highlight cannot shift it horizontally.
  savedScrollX = window.scrollX
  savedScrollY = window.scrollY
  const html = document.documentElement
  const body = document.body
  prevHtmlOverflow = html.style.overflow
  prevBodyOverflow = body ? body.style.overflow : ""
  html.style.overflow = "hidden"
  pickerActive = true

  injectStyles()

  const overlay = document.createElement("div")
  overlay.id = OVERLAY_ID
  document.documentElement.appendChild(overlay)

  ensureHighlightElement()

  mouseMoveHandler = (e: MouseEvent) => {
    // Temporarily disable overlay so elementFromPoint sees real page content.
    overlay.style.pointerEvents = "none"
    const el = document.elementFromPoint(e.clientX, e.clientY)
    overlay.style.pointerEvents = "auto"

    if (el && isEditable(el)) {
      hovered = el
      const rect = el.getBoundingClientRect()
      positionHighlight(rect)
    } else {
      hovered = null
      hideHighlight()
    }
  }

  clickHandler = (e: MouseEvent) => {
    if (!hovered) return
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()

    const target = hovered
    const cb = activeCallbacks
    destroyPicker()
    if (cb) cb.onSelect(target)
  }

  keyHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      destroyPicker()
      activeCallbacks?.onClose()
    }
  }

  contextMenuHandler = (e: MouseEvent) => {
    e.preventDefault()
    destroyPicker()
    activeCallbacks?.onClose()
  }

  // Use capture phase so we intercept before page handlers.
  document.addEventListener("mousemove", mouseMoveHandler, true)
  document.addEventListener("click", clickHandler, true)
  document.addEventListener("keydown", keyHandler, true)
  document.addEventListener("contextmenu", contextMenuHandler, true)
}

export function destroyPicker(): void {
  if (mouseMoveHandler) document.removeEventListener("mousemove", mouseMoveHandler, true)
  if (clickHandler) document.removeEventListener("click", clickHandler, true)
  if (keyHandler) document.removeEventListener("keydown", keyHandler, true)
  if (contextMenuHandler) document.removeEventListener("contextmenu", contextMenuHandler, true)

  mouseMoveHandler = null
  clickHandler = null
  keyHandler = null
  contextMenuHandler = null

  document.getElementById(OVERLAY_ID)?.remove()
  document.getElementById(HIGHLIGHT_ID)?.remove()
  removeStyles()

  // Restore the page's overflow and scroll position only if we changed it.
  if (pickerActive) {
    const html = document.documentElement
    const body = document.body
    html.style.overflow = prevHtmlOverflow
    if (body) body.style.overflow = prevBodyOverflow
    window.scrollTo(savedScrollX, savedScrollY)
    pickerActive = false
  }

  hovered = null
  activeCallbacks = null
}
