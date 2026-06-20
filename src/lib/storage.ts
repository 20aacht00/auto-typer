import type { ExtensionSettings, ExtensionState } from "@src/types/messages"

const STORAGE_KEY = "auto_typer_state"

const DEFAULT_SETTINGS: ExtensionSettings = {
  defaultMode: "focused",
  rememberLastText: true,
  typingSpeed: "max"
}

const DEFAULT_STATE: ExtensionState = {
  lastText: "",
  settings: DEFAULT_SETTINGS
}

export async function loadState(): Promise<ExtensionState> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY)
    const stored = result[STORAGE_KEY] as Partial<ExtensionState> | undefined
    return {
      lastText: stored?.lastText ?? DEFAULT_STATE.lastText,
      settings: { ...DEFAULT_SETTINGS, ...stored?.settings }
    }
  } catch {
    return DEFAULT_STATE
  }
}

export async function saveLastText(text: string): Promise<void> {
  try {
    const state = await loadState()
    await chrome.storage.local.set({
      [STORAGE_KEY]: { ...state, lastText: text }
    })
  } catch {
    // ignore storage failures
  }
}

export async function saveSettings(settings: Partial<ExtensionSettings>): Promise<void> {
  try {
    const state = await loadState()
    const merged = { ...state.settings, ...settings }
    await chrome.storage.local.set({
      [STORAGE_KEY]: { ...state, settings: merged }
    })
  } catch {
    // ignore storage failures
  }
}
