@echo off
chcp 65001 >nul 2>&1
REM ============================================================
REM  Auto Typer - one-click installer (Windows)
REM  Just double-click this file. No Node.js / npm / build tools.
REM  Downloads scripts/install.ps1 from GitHub and runs it.
REM ============================================================

set "PS1=%TEMP%\at-install.ps1"

REM Download the installer script to a temp file (preserves UTF-8)
powershell -ExecutionPolicy Bypass -NoProfile -Command "$ProgressPreference='SilentlyContinue'; try { Invoke-WebRequest -UseBasicParsing 'https://raw.githubusercontent.com/20aacht00/auto-typer/main/scripts/install.ps1' -OutFile '%PS1%' } catch { Write-Host 'ERROR: download failed' -ForegroundColor Red; exit 1 }"

if errorlevel 1 (
    echo.
    echo Download failed. Check your internet connection.
    pause
    exit /b 1
)

REM Run the installer with proper UTF-8 encoding
powershell -ExecutionPolicy Bypass -NoProfile -ExecutionPolicy Bypass -File "%PS1%"

REM Cleanup
del "%PS1%" >nul 2>&1
pause
