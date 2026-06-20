import { useCallback, useMemo, useState } from "react"
import { Send, MousePointerClick, Settings, X, Zap } from "lucide-react"
import { injectIntoActiveTab, togglePickerOnActiveTab } from "@lib/messaging"
import { useExtensionState } from "@lib/use-extension-state"
import type { ExtensionSettings, TargetMode, TypingSpeed } from "@src/types/messages"

type StatusKind = "idle" | "success" | "error" | "typing"

interface StatusState {
  kind: StatusKind
  message: string
}

interface TyperPanelProps {
  variant: "popup" | "sidepanel"
}

const SPEED_LABELS: Record<TypingSpeed, string> = {
  instant: "آنی (درج یکجا)",
  max: "حداکثر سرعت",
  fast: "سریع",
  medium: "متوسط",
  slow: "کند"
}

export function TyperPanel({ variant }: TyperPanelProps) {
  const { text, setText, settings, updateMode, updateRemember, updateTypingSpeed, loaded } =
    useExtensionState()
  const [status, setStatus] = useState<StatusState>({ kind: "idle", message: "" })
  const [showSettings, setShowSettings] = useState(false)
  const [busy, setBusy] = useState(false)

  const charCount = useMemo(() => text.length, [text])

  const flashStatus = useCallback((s: StatusState) => {
    setStatus(s)
    if (s.kind !== "typing") return
  }, [])

  const handleInject = useCallback(
    async (mode: TargetMode) => {
      if (!text.trim()) {
        flashStatus({ kind: "error", message: "ابتدا متن را وارد کنید." })
        window.setTimeout(() => setStatus({ kind: "idle", message: "" }), 2500)
        return
      }
      setBusy(true)
      if (mode === "focused" && settings.typingSpeed !== "instant") {
        flashStatus({ kind: "typing", message: "در حال تایپ…" })
      }
      let ok = false
      try {
        if (mode === "picker") {
          ok = await togglePickerOnActiveTab(text)
        } else {
          ok = await injectIntoActiveTab(text, "focused", settings.typingSpeed)
        }
      } finally {
        setBusy(false)
      }
      if (!ok) {
        setStatus({
          kind: "error",
          message: "صفحه پشتیبانی نمی‌کند. صفحه‌ای را باز کنید و دوباره تلاش کنید."
        })
      } else if (mode === "focused") {
        setStatus({ kind: "success", message: "تایپ کامل شد." })
      } else {
        setStatus({
          kind: "success",
          message: "حالت انتخاب فعال شد. روی فیلد دلخواه کلیک کنید."
        })
      }
      window.setTimeout(() => setStatus({ kind: "idle", message: "" }), 2500)
    },
    [text, settings.typingSpeed, flashStatus]
  )

  const rootClass =
    variant === "popup"
      ? "flex h-[420px] w-[360px] flex-col bg-gray-50 text-gray-900"
      : "flex h-full w-full min-h-screen flex-col bg-gray-50 text-gray-900"

  if (!loaded) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        در حال بارگذاری…
      </div>
    )
  }

  return (
    <div className={rootClass}>
      <header className="flex items-center justify-between bg-brand-600 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Zap size={18} />
          <h1 className="text-sm font-semibold">Auto Typer</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings((s) => !s)}
          className="rounded p-1 transition hover:bg-white/20"
          aria-label="تنظیمات"
        >
          {showSettings ? <X size={16} /> : <Settings size={16} />}
        </button>
      </header>

      {showSettings ? (
        <SettingsPanel
          settings={settings}
          onChangeMode={updateMode}
          onChangeRemember={updateRemember}
          onChangeSpeed={updateTypingSpeed}
          onClose={() => setShowSettings(false)}
        />
      ) : (
        <main className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
          <label className="text-xs font-medium text-gray-600">متن برای درج</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="متن خود را اینجا بنویسید یا پیست کنید…"
            dir="auto"
            autoFocus
            className="flex-1 resize-none rounded-lg border border-gray-300 bg-white p-3 text-sm leading-relaxed outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>{charCount} کاراکتر</span>
            <span>سرعت: {SPEED_LABELS[settings.typingSpeed]}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => handleInject("focused")}
              className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={15} />
              تایپ در فیلد فعال
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleInject("picker")}
              className="flex items-center justify-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MousePointerClick size={15} />
              انتخاب فیلد
            </button>
          </div>

          <StatusBar status={status} />
        </main>
      )}
    </div>
  )
}

function StatusBar({ status }: { status: StatusState }) {
  if (status.kind === "idle") return <div className="h-6" />
  const color =
    status.kind === "success"
      ? "text-green-600 bg-green-50"
      : status.kind === "typing"
        ? "text-brand-700 bg-brand-50"
        : "text-red-600 bg-red-50"
  return (
    <div className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${color}`}>
      {status.kind === "typing" && (
        <span className="h-3 w-3 animate-pulse rounded-full bg-brand-500" />
      )}
      {status.message}
    </div>
  )
}

interface SettingsPanelProps {
  settings: ExtensionSettings
  onChangeMode: (mode: TargetMode) => void
  onChangeRemember: (v: boolean) => void
  onChangeSpeed: (speed: TypingSpeed) => void
  onClose: () => void
}

function SettingsPanel({
  settings,
  onChangeMode,
  onChangeRemember,
  onChangeSpeed,
  onClose
}: SettingsPanelProps) {
  return (
    <main className="flex flex-1 flex-col gap-4 overflow-auto p-4">
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          سرعت تایپ
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {(["instant", "max", "fast", "medium", "slow"] as TypingSpeed[]).map((speed) => (
            <ModeButton
              key={speed}
              active={settings.typingSpeed === speed}
              label={SPEED_LABELS[speed]}
              description=""
              onClick={() => onChangeSpeed(speed)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          حالت پیش‌فرض
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <ModeButton
            active={settings.defaultMode === "focused"}
            label="فیلد فعال"
            description="تایپ در عنصر فعلی"
            onClick={() => onChangeMode("focused")}
          />
          <ModeButton
            active={settings.defaultMode === "picker"}
            label="انتخاب"
            description="کلیک روی فیلد هدف"
            onClick={() => onChangeMode("picker")}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          حافظه
        </h2>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
          <input
            type="checkbox"
            checked={settings.rememberLastText}
            onChange={(e) => onChangeRemember(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand-600"
          />
          <span className="text-xs leading-relaxed text-gray-700">
            ذخیره‌ی آخرین متن بین جلسات. بعد از بستن و باز کردن افزونه متن باقی می‌ماند.
          </span>
        </label>
      </section>

      <section className="mt-auto rounded-lg bg-gray-100 p-3 text-[11px] leading-relaxed text-gray-500">
        میانبرها:
        <br />
        <kbd className="rounded bg-white px-1">Ctrl+Shift+Space</kbd> — درج سریع
        <br />
        <kbd className="rounded bg-white px-1">Ctrl+Shift+E</kbd> — فعال‌سازی انتخاب
      </section>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-900"
      >
        بازگشت
      </button>
    </main>
  )
}

function ModeButton({
  active,
  label,
  description,
  onClick
}: {
  active: boolean
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition ${
        active
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
      }`}
    >
      <div className="text-sm font-semibold">{label}</div>
      <div className="mt-0.5 text-[11px] text-gray-500">{description}</div>
    </button>
  )
}
