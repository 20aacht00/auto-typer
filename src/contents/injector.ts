import type { PlasmoCSConfig } from "plasmo"
import { injectText } from "@lib/inject-value"
import { typeText } from "@lib/type-text"
import type { ExtensionMessage, TypingSpeed } from "@src/types/messages"
import { createPicker, destroyPicker } from "@lib/picker"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_idle"
}

const SPEED_DELAY_MS: Record<TypingSpeed, number> = {
  instant: -1, // sentinel: use instant value-set instead of typing
  max: 0,
  fast: 5,
  medium: 25,
  slow: 60
}

let pendingPickerText: string | null = null
let pendingPickerSpeed: TypingSpeed = "max"

async function performTyping(
  target: Element | null | undefined,
  text: string,
  speed: TypingSpeed
): Promise<{ success: boolean; error?: string }> {
  if (speed === "instant") {
    const error = injectText(target, text)
    return { success: !error, error }
  }

  const result = await typeText(target, text, {
    charDelayMs: SPEED_DELAY_MS[speed]
  })
  return { success: !result.error, error: result.error }
}

chrome.runtime?.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (!message || typeof message !== "object" || !("type" in message)) {
    return false
  }

  switch (message.type) {
    case "INJECT_TEXT": {
      if (pendingPickerText !== null) {
        destroyPicker()
        pendingPickerText = null
      }
      const target = document.activeElement
      performTyping(target, message.text, message.speed ?? "max").then((res) => {
        sendResponse({ success: res.success, error: res.error })
      })
      return true // keep message channel open for async response
    }

    case "TOGGLE_PICKER": {
      if (pendingPickerText !== null) {
        destroyPicker()
        pendingPickerText = null
        sendResponse({ success: true })
        return true
      }
      pendingPickerText = message.text
      pendingPickerSpeed = "max"
      createPicker({
        text: message.text,
        onSelect: async (element) => {
          await performTyping(element, message.text, pendingPickerSpeed)
        },
        onClose: () => {
          pendingPickerText = null
        }
      })
      sendResponse({ success: true })
      return true
    }

    case "PICKER_CANCEL": {
      destroyPicker()
      pendingPickerText = null
      sendResponse({ success: true })
      return true
    }

    default:
      return false
  }
})
