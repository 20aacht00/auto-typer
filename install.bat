@echo off
REM ============================================================
REM  Auto Typer - one-click installer (Windows)
REM  Double-click this file. No Node.js / npm needed.
REM  Downloads scripts/install.ps1 from GitHub and runs it.
REM ============================================================

set "PS1=%TEMP%\at-install.ps1"

echo Downloading installer...
powershell -ExecutionPolicy Bypass -NoProfile -Command "$ProgressPreference='SilentlyContinue'; try { Invoke-WebRequest -UseBasicParsing 'https://raw.githubusercontent.com/20aacht00/auto-typer/main/scripts/install.ps1' -OutFile '%PS1%' } catch { exit 1 }"

if errorlevel 1 (
    echo.
    echo Download failed. Check your internet connection.
    pause
    exit /b 1
)

powershell -ExecutionPolicy Bypass -NoProfile -File "%PS1%"
del "%PS1%" >nul 2>&1
pause
