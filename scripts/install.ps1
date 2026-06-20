# Auto Typer - Installer for non-technical users.
# Downloads the latest pre-built extension from GitHub Releases, extracts it,
# copies the folder path to the clipboard, and opens chrome://extensions.
#
# This file is fetched & run by install.bat so users only need to download
# one file (install.bat) and double-click it.

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$RepoOwner = "20aacht00"
$RepoName = "auto-typer"
$AssetName = "auto-typer-chrome.zip"
$InstallDir = Join-Path $env:LOCALAPPDATA "auto-typer"
$ZipPath = Join-Path $env:TEMP "auto-typer-chrome.zip"

$DownloadUrl = "https://github.com/$RepoOwner/$RepoName/releases/latest/download/$AssetName"

function Write-Step($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-Ok($msg) { Write-Host $msg -ForegroundColor Green }
function Write-Err($msg) { Write-Host $msg -ForegroundColor Red }

Write-Host ""
Write-Host "  =======================================" -ForegroundColor Cyan
Write-Host "      Auto Typer - نصب خودکار" -ForegroundColor Cyan
Write-Host "  =======================================" -ForegroundColor Cyan
Write-Host ""

# 1) Download
Write-Step "1) در حال دانلود افزونه..."
try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath -UseBasicParsing
} catch {
    Write-Err "خطا در دانلود. ممکن است هنوز نسخه‌ای منتشر نشده باشد."
    Write-Err "از توسعه‌دهنده بخواهید یک نسخه (tag v...) منتشر کند."
    Write-Host ""
    Read-Host "برای خروج Enter بزن"
    exit 1
}
Write-Ok "   دانلود کامل شد."

# 2) Extract
Write-Step "2) در حال استخراج فایل‌ها..."
if (Test-Path $InstallDir) {
    Remove-Item $InstallDir -Recurse -Force
}
Expand-Archive -Path $ZipPath -DestinationPath $InstallDir -Force
Remove-Item $ZipPath -Force
Write-Ok "   استخراج در: $InstallDir"

# 3) Copy path to clipboard so the user can paste it directly
Set-Clipboard -Value $InstallDir

# 4) Open chrome extensions page
Write-Step "3) باز کردن صفحه‌ی افزونه‌های کروم..."
Start-Process "chrome://extensions"

Write-Host ""
Write-Ok " نصب آماده است! اکنون این مراحل را دنبال کن:"
Write-Host ""
Write-Host "   1. گوشه‌ی بالا-راست:  Developer mode  را روشن کن" -ForegroundColor White
Write-Host "   2. روی  Load unpacked  کلیک کن" -ForegroundColor White
Write-Host "   3. مسیر زیر (که کپی شده) را در نوار آدرس پنجره بازشده پیست کن:" -ForegroundColor White
Write-Host ""
Write-Host "      $InstallDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "   4. روی پوشه کلیک کن و  Select Folder  را بزن" -ForegroundColor White
Write-Host ""
Write-Host "  مسیر نصب در کلیپ‌بورد کپی شد — می‌توانی مستقیم پیست کنی (Ctrl+V)." -ForegroundColor DarkGray
Write-Host ""
Read-Host "برای پایان Enter بزن"
