@echo off
REM ============================================================
REM  Auto Typer - one-click installer (Windows)
REM  SELF-CONTAINED: all logic in this file. Pure ASCII.
REM ============================================================

echo.
echo   =======================================
echo       Auto Typer - Installer
echo   =======================================
echo.

echo [1/3] Downloading extension...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; Invoke-WebRequest 'https://github.com/20aacht00/auto-typer/releases/latest/download/auto-typer-chrome.zip' -OutFile '%TEMP%\at.zip' -UseBasicParsing"
if not exist "%TEMP%\at.zip" goto :error
echo       Done.

echo [2/3] Extracting files...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; if (Test-Path '%LOCALAPPDATA%\auto-typer') { Remove-Item '%LOCALAPPDATA%\auto-typer' -Recurse -Force }; Expand-Archive '%TEMP%\at.zip' '%LOCALAPPDATA%\auto-typer' -Force; Remove-Item '%TEMP%\at.zip'"
if not exist "%LOCALAPPDATA%\auto-typer\manifest.json" goto :error
echo       Done.

echo [3/3] Copying path and opening Chrome...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-Clipboard '%LOCALAPPDATA%\auto-typer'"
start "" "chrome://extensions"

echo.
echo   =======================================
echo   SUCCESS! Follow these steps in Chrome:
echo   =======================================
echo.
echo   1. Turn ON  Developer mode  (top-right)
echo   2. Click  Load unpacked
echo   3. Paste this path (Ctrl+V):
echo.
echo      %LOCALAPPDATA%\auto-typer
echo.
echo   4. Select Folder
echo.
echo   Path is in clipboard - just Ctrl+V.
echo.
pause
exit /b 0

:error
echo.
echo   INSTALLATION FAILED.
echo   Check your internet connection and try again.
echo.
pause
exit /b 1
