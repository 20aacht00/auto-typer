# Auto Typer - Installer for non-technical users.
# Downloads the latest pre-built extension from GitHub Releases, extracts it,
# copies the folder path to the clipboard, and opens chrome://extensions.

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$RepoOwner = "20aacht00"
$RepoName = "auto-typer"
$AssetName = "auto-typer-chrome.zip"
$InstallDir = Join-Path $env:LOCALAPPDATA "auto-typer"
$ZipPath = Join-Path $env:TEMP "auto-typer-chrome.zip"

$DownloadUrl = "https://github.com/$RepoOwner/$RepoName/releases/latest/download/$AssetName"

Write-Host ""
Write-Host "  =======================================" -ForegroundColor Cyan
Write-Host "      Auto Typer - نصب خودکار" -ForegroundColor Cyan
Write-Host "  =======================================" -ForegroundColor Cyan
Write-Host ""

# 1) Download
Write-Host "[1/3] در حال دانلود افزونه..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath -UseBasicParsing
} catch {
    Write-Host ""
    Write-Host "خطا در دانلود. ممکن است هنوز نسخه‌ای منتشر نشده باشد." -ForegroundColor Red
    Read-Host "برای خروج Enter بزن"
    exit 1
}
Write-Host "      انجام شد." -ForegroundColor Green

# 2) Extract
Write-Host "[2/3] در حال استخراج فایل‌ها..." -ForegroundColor Yellow
if (Test-Path $InstallDir) {
    Remove-Item $InstallDir -Recurse -Force
}
Expand-Archive -Path $ZipPath -DestinationPath $InstallDir -Force
Remove-Item $ZipPath -Force
Write-Host "      مسیر: $InstallDir" -ForegroundColor Green

# 3) Copy path to clipboard
Set-Clipboard -Value $InstallDir

# 4) Open chrome extensions page
Write-Host "[3/3] باز کردن صفحه‌ی افزونه‌های کروم..." -ForegroundColor Yellow
try {
    Start-Process "chrome://extensions"
} catch {
    try { Start-Process "chrome.exe" -ArgumentList "chrome://extensions" } catch {}
}

Write-Host ""
Write-Host "  =======================================" -ForegroundColor Green
Write-Host "  نصب آماده است! این مراحل را دنبال کن:" -ForegroundColor Green
Write-Host "  =======================================" -ForegroundColor Green
Write-Host ""
Write-Host "  1. گوشه بالا-راست: Developer mode را روشن کن" -ForegroundColor White
Write-Host "  2. روی Load unpacked کلیک کن" -ForegroundColor White
Write-Host "  3. مسیر زیر را پیست کن (Ctrl+V) و Enter بزن:" -ForegroundColor White
Write-Host ""
Write-Host "     $InstallDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "  4. روی پوشه کلیک کن و Select Folder را بزن" -ForegroundColor White
Write-Host ""
Write-Host "  مسیر در کلیپ‌بورد کپی شده — مستقیم Ctrl+V بزن." -ForegroundColor DarkGray
Write-Host ""
Write-Host "  =======================================" -ForegroundColor Cyan
Read-Host "  پایان — Enter بزن"
