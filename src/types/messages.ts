export type TargetMode = "focused" | "picker"

export type TypingSpeed = "instant" | "max" | "fast" | "medium" | "slow"

export interface InjectRequest {
  type: "INJECT_TEXT"
  text: string
  mode: TargetMode
  speed: TypingSpeed
}

export type ExtensionMessage =
  | InjectRequest
  | { type: "TOGGLE_PICKER"; text: string }
  | { type: "PICKER_CANCEL" }
  | { type: "PICKER_SELECTED"; selector: string; text: string }
  | { type: "INJECTION_RESULT"; success: boolean; error?: string }

export interface ExtensionSettings {
  defaultMode: TargetMode
  rememberLastText: boolean
  typingSpeed: TypingSpeed
}

export interface ExtensionState {
  lastText: string
  settings: ExtensionSettings
}
