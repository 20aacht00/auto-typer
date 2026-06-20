import type { ExtensionMessage, TypingSpeed } from "@src/types/messages"

export async function sendToActiveTab(message: ExtensionMessage): Promise<boolean> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return false

    await chrome.tabs.sendMessage(tab.id, message)
    return true
  } catch {
    return false
  }
}

export async function injectIntoActiveTab(
  text: string,
  mode: "focused" | "picker",
  speed: TypingSpeed
): Promise<boolean> {
  return sendToActiveTab({ type: "INJECT_TEXT", text, mode, speed })
}

export async function togglePickerOnActiveTab(text: string): Promise<boolean> {
  return sendToActiveTab({ type: "TOGGLE_PICKER", text })
}
