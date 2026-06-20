@echo off
REM ============================================================
REM  Auto Typer - one-click installer (Windows)
REM  SELF-CONTAINED: no external script download needed.
REM  Just double-click this file. Pure ASCII - no encoding issues.
REM ============================================================

powershell -ExecutionPolicy Bypass -NoProfile -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$ProgressPreference='SilentlyContinue';" ^
  "$dir=$env:LOCALAPPDATA+'\auto-typer';" ^
  "$zip=$env:TEMP+'\auto-typer-chrome.zip';" ^
  "$url='https://github.com/20aacht00/auto-typer/releases/latest/download/auto-typer-chrome.zip';" ^
  "Write-Host '';" ^
  "Write-Host '  =======================================' -ForegroundColor Cyan;" ^
  "Write-Host '      Auto Typer - Installer' -ForegroundColor Cyan;" ^
  "Write-Host '  =======================================' -ForegroundColor Cyan;" ^
  "Write-Host '';" ^
  "Write-Host '[1/3] Downloading extension...' -ForegroundColor Yellow;" ^
  "try { Invoke-WebRequest -UseBasicParsing $url -OutFile $zip } catch { Write-Host 'ERROR: Download failed. Check internet or release may not exist.' -ForegroundColor Red; Read-Host 'Press Enter'; exit 1 };" ^
  "Write-Host '      Done.' -ForegroundColor Green;" ^
  "Write-Host '[2/3] Extracting files...' -ForegroundColor Yellow;" ^
  "if (Test-Path $dir) { Remove-Item $dir -Recurse -Force };" ^
  "Expand-Archive $zip $dir -Force;" ^
  "Remove-Item $zip -Force;" ^
  "Set-Clipboard $dir;" ^
  "Write-Host '      Location:' $dir -ForegroundColor Green;" ^
  "Write-Host '[3/3] Opening Chrome extensions page...' -ForegroundColor Yellow;" ^
  "try { Start-Process 'chrome://extensions' } catch {};" ^
  "Write-Host '';" ^
  "Write-Host '  =======================================' -ForegroundColor Green;" ^
  "Write-Host '  DONE! Now in the Chrome page:' -ForegroundColor Green;" ^
  "Write-Host '  =======================================' -ForegroundColor Green;" ^
  "Write-Host '';" ^
  "Write-Host '  1. Turn ON  Developer mode  (top-right)' -ForegroundColor White;" ^
  "Write-Host '  2. Click  Load unpacked' -ForegroundColor White;" ^
  "Write-Host '  3. Paste this path (Ctrl+V) + Enter:' -ForegroundColor White;" ^
  "Write-Host '';" ^
  "Write-Host '    ' $dir -ForegroundColor Cyan;" ^
  "Write-Host '';" ^
  "Write-Host '  4. Click  Select Folder' -ForegroundColor White;" ^
  "Write-Host '';" ^
  "Write-Host '  Path is in clipboard - just Ctrl+V.' -ForegroundColor DarkGray;" ^
  "Write-Host '';" ^
  "Read-Host '  Press Enter to finish'"

echo.
pause
