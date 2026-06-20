# Auto Typer - Installer for non-technical users.
# Pure ASCII on purpose: Windows PowerShell 5.1 garbles non-ASCII in .ps1
# files without BOM. Persian instructions are shown in the browser instead.

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$RepoOwner = "20aacht00"
$RepoName = "auto-typer"
$AssetName = "auto-typer-chrome.zip"
$InstallDir = Join-Path $env:LOCALAPPDATA "auto-typer"
$ZipPath = Join-Path $env:TEMP "auto-typer-chrome.zip"

$DownloadUrl = "https://github.com/$RepoOwner/$RepoName/releases/latest/download/$AssetName"

Write-Host ""
Write-Host "  =======================================" -ForegroundColor Cyan
Write-Host "      Auto Typer - Installer" -ForegroundColor Cyan
Write-Host "  =======================================" -ForegroundColor Cyan
Write-Host ""

# 1) Download
Write-Host "[1/3] Downloading extension..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath -UseBasicParsing
} catch {
    Write-Host ""
    Write-Host "ERROR: Download failed. No release may exist yet." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "      Done." -ForegroundColor Green

# 2) Extract
Write-Host "[2/3] Extracting files..." -ForegroundColor Yellow
if (Test-Path $InstallDir) {
    Remove-Item $InstallDir -Recurse -Force
}
Expand-Archive -Path $ZipPath -DestinationPath $InstallDir -Force
Remove-Item $ZipPath -Force
Write-Host "      Location: $InstallDir" -ForegroundColor Green

# 3) Copy path to clipboard
Set-Clipboard -Value $InstallDir
Write-Host "      Folder path copied to clipboard." -ForegroundColor Green

# 4) Open chrome extensions page
Write-Host "[3/3] Opening Chrome..." -ForegroundColor Yellow
try {
    Start-Process "chrome://extensions"
} catch {
    try { Start-Process "chrome.exe" -ArgumentList "chrome://extensions" } catch {}
}

Write-Host ""
Write-Host "  =======================================" -ForegroundColor Green
Write-Host "  DONE! Now in the Chrome page that opened:" -ForegroundColor Green
Write-Host "  =======================================" -ForegroundColor Green
Write-Host ""
Write-Host "  1. Turn ON  Developer mode  (top-right)" -ForegroundColor White
Write-Host "  2. Click  Load unpacked" -ForegroundColor White
Write-Host "  3. Paste this path (Ctrl+V) + Enter:" -ForegroundColor White
Write-Host ""
Write-Host "     $InstallDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "  4. Click  Select Folder" -ForegroundColor White
Write-Host ""
Write-Host "  Path is in your clipboard - just Ctrl+V." -ForegroundColor DarkGray
Write-Host ""
Write-Host "  =======================================" -ForegroundColor Cyan
Read-Host "  Press Enter to finish"
