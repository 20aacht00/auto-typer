// Background service worker.
// - Clicking the toolbar icon opens the side panel (stays open while you
//   interact with the page, unlike a popup which closes on blur).
// - Global keyboard shortcut commands inject into the active tab.

import { loadState } from "@lib/storage"

// Open the side panel when the toolbar action is clicked.
chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {})
  }
})

chrome.commands?.onCommand.addListener(async (command) => {
  if (command !== "inject-last-text" && command !== "toggle-picker") return

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) return

  const { lastText, settings } = await loadState()
  if (!lastText) return

  const message =
    command === "toggle-picker"
      ? { type: "TOGGLE_PICKER", text: lastText }
      : {
          type: "INJECT_TEXT",
          text: lastText,
          mode: "focused",
          speed: settings.typingSpeed
        }

  try {
    await chrome.tabs.sendMessage(tab.id, message)
  } catch {
    // Tab may not have the content script (e.g. chrome:// pages). Ignore.
  }
})

export {}
