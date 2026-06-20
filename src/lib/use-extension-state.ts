import { useEffect, useState, useCallback } from "react"
import { loadState, saveLastText, saveSettings } from "@lib/storage"
import type { ExtensionSettings, TargetMode, TypingSpeed } from "@src/types/messages"

export function useExtensionState() {
  const [text, setText] = useState("")
  const [settings, setSettings] = useState<ExtensionSettings>({
    defaultMode: "focused",
    rememberLastText: true,
    typingSpeed: "max"
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadState().then((state) => {
      if (cancelled) return
      setText(state.lastText)
      setSettings(state.settings)
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const updateText = useCallback(
    (value: string) => {
      setText(value)
      if (settings.rememberLastText) {
        saveLastText(value)
      }
    },
    [settings.rememberLastText]
  )

  const updateMode = useCallback((mode: TargetMode) => {
    setSettings((prev) => {
      const next = { ...prev, defaultMode: mode }
      saveSettings({ defaultMode: mode })
      return next
    })
  }, [])

  const updateRemember = useCallback((remember: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, rememberLastText: remember }
      saveSettings({ rememberLastText: remember })
      return next
    })
  }, [])

  const updateTypingSpeed = useCallback((speed: TypingSpeed) => {
    setSettings((prev) => {
      const next = { ...prev, typingSpeed: speed }
      saveSettings({ typingSpeed: speed })
      return next
    })
  }, [])

  return {
    text,
    setText: updateText,
    settings,
    updateMode,
    updateRemember,
    updateTypingSpeed,
    loaded
  }
}
