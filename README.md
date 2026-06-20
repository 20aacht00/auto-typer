# Auto Typer

افزونه‌ی مرورگر برای درج سریع متن در هر فیلد ورودی وب‌سایت. متن را در پنجره‌ی افزونه وارد می‌کنید و با یک کلیک (یا میانبر) در فیلد دلخواه درج می‌شود.

A browser extension that injects text into any website input field. Paste text into the popup, click inject, and it appears in the target field — fully compatible with React, Angular, Vue and contentEditable editors.

## امکانات

- **درج در فیلد فعال**: متن مستقیماً در عنصری که فوکوس دارد درج می‌شود.
- **حالت انتخاب (Picker)**: روی هر فیلدی کلیک کنید تا متن آنجا درج شود (با highlight قابل دیدن).
- **سازگار با فریم‌ورک‌ها**: از native value setter + event dispatch استفاده می‌کند تا React/Angular/Vue تغییر را تشخیص دهند.
- **پشتیبانی از contentEditable**: برای ویرایشگرهای غنی‌متن مثل Gmail، Slack و ... .
- **میانبرهای کیبورد**: درج سریع بدون باز کردن popup.
- **ذخیره‌ی خودکار**: آخرین متن بین جلسات حفظ می‌شود.

## میانبرها

| میانبر | عملکرد |
|---|---|
| `Ctrl+Shift+Space` (`Cmd+Shift+Space` در مک) | درج آخرین متن در فیلد فعال |
| `Ctrl+Shift+E` (`Cmd+Shift+E` در مک) | فعال/غیرفعال کردن حالت انتخاب |
| `Esc` (در حالت انتخاب) | لغو حالت انتخاب |

## ساخت و نصب

### پیش‌نیازها

- Node.js 18+ و npm
- برای نصب وابستگی‌های native روی ویندوز، اجرای `npm install` به Python و ابزار build نیاز دارد. اگر نصب شکست خورد:

```powershell
npm install --ignore-scripts --no-audit --no-fund
npm rebuild sharp
```

### مراحل

```powershell
# نصب وابستگی‌ها
npm install

# تولید آیکون‌ها (یک‌بار)
node scripts/generate-icons.mjs

# ساخت افزونه (خروجی در build/chrome-mv3-prod)
npm run build
```

### بارگذاری در مرورگر (دسکتاپ)

1. کروم/اج/برو را باز کنید و به `chrome://extensions` بروید.
2. «Developer mode» (حالت توسعه‌دهنده) را در گوشه بالا راست فعال کنید.
3. روی «Load unpacked» کلیک کنید و پوشه‌ی `build/chrome-mv3-prod` را انتخاب کنید.
4. آیکون Auto Typer در نوار ابزار ظاهر می‌شود.

### توسعه

```powershell
npm run dev
```

HMR فعال است و تغییرات به‌صورت زنده بارگذاری می‌شوند.

## نصب روی موبایل

مرورگرهای موبایل معمولاً از افزونه‌ها پشتیبانی نمی‌کنند، مگر موارد زیر:

### Android

- **Kiwi Browser** (مبتنی بر Chromium): از افزونه‌های Chrome Web Store و فایل‌های `.crx` پشتیبانی می‌کند. ساده‌ترین راه: افزونه را در Chrome Web Store منتشر کنید و در Kiwi نصب کنید.
- **Edge Mobile**: پشتیبانی محدود از افزونه‌ها.
- راه دستی: فایل zip افزونه را روی گوشی کپی کنید، در `edge://extensions` یا `kiwe://extensions` حالت developer را فعال و load unpacked کنید (ممکن است محدودیت‌هایی داشته باشد).

### iOS

- **Safari 15+**: از Web Extensions پشتیبانی می‌کند. باید افزونه را به Xcode به‌عنوان Safari Web Extension بسته‌بندی کنید. راهنما: [Converting a web extension for Safari](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_to_safari_web_extensions)

## معماری

```
src/
├── popup.tsx                 # رابط کاربری Popup (React)
├── background.ts             # Service Worker (میانبرها)
├── contents/
│   └── injector.ts           # Content script: دریافت پیام و تزریق
├── lib/
│   ├── inject-value.ts       # منطق اصلی تزریق (سازگار با فریم‌ورک‌ها)
│   ├── picker.ts             # overlay انتخاب فیلد با کلیک
│   ├── messaging.ts          # ارسال پیام به tab فعال
│   ├── storage.ts            # wrapper برای chrome.storage
│   └── use-extension-state.ts # hook مشترک state
├── types/
│   └── messages.ts           # تعریف type پیام‌ها
└── style.css                 # استایل پایه + Tailwind
```

### چرا فقط `el.value = x` کافی نیست؟

React و Vue روی input‌ها value را به‌صورت controlled track می‌کنند و به تغییر مستقیم `value` واکنش نشان نمی‌دهند. راه‌حل: استفاده از native setter روی prototype و سپس dispatch رویداد `input`:

```typescript
const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set
setter.call(element, text)
element.dispatchEvent(new Event("input", { bubbles: true }))
```

این الگو در `src/lib/inject-value.ts` پیاده‌سازی شده و برای `<input>`, `<textarea>`, `<select>` و عناصر `contentEditable` کار می‌کند.

## محدودیت‌ها

- صفحات داخلی مرورگر (`chrome://`, `edge://`) اجازه‌ی content script نمی‌دهند.
- سایت‌هایی با CSP بسیار سخت‌گیرانه ممکن است اجرای script را مسدود کنند.
- ویرایشگرهای مبتنی بر canvas (مثل Google Docs کلاسیک) نیاز به شبیه‌سازی رویدادهای کیبورد دارند که در نسخه‌ی فعلی پشتیبانی نمی‌شود.
- انتشار در Chrome Web Store نیاز به پرداخت یک‌بارۀ ۵ دلاری دارد.

## انتشار (Chrome Web Store)

```powershell
npm run package    # خروجی: build/chrome-mv3-prod.zip
```

سپس فایل zip را در [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) آپلود کنید.
