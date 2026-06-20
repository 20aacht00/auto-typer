@echo off
REM ============================================================
REM  Auto Typer - one-click installer (Windows)
REM  Extracts the extension right next to this file (visible folder)
REM  and opens it in Explorer so the user can see it.
REM ============================================================

echo.
echo   =======================================
echo       Auto Typer - Installer
echo   =======================================
echo.

REM Extract next to this install.bat file so the user can see it
set "INSTALL_DIR=%~dp0Auto-Typer"

echo   Folder: %INSTALL_DIR%
echo.
echo [1/3] Downloading extension...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; Invoke-WebRequest 'https://github.com/20aacht00/auto-typer/releases/latest/download/auto-typer-chrome.zip' -OutFile '%TEMP%\at.zip' -UseBasicParsing"
if not exist "%TEMP%\at.zip" goto :error
echo       Done.

echo [2/3] Extracting files...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; if (Test-Path '%INSTALL_DIR%') { Remove-Item '%INSTALL_DIR%' -Recurse -Force }; Expand-Archive '%TEMP%\at.zip' '%INSTALL_DIR%' -Force; Remove-Item '%TEMP%\at.zip'"
if not exist "%INSTALL_DIR%\manifest.json" goto :error
echo       Done.

echo [3/3] Opening folder and Chrome...

REM Copy path to clipboard
powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-Clipboard '%INSTALL_DIR%'"

REM Open the folder in Explorer so user sees it
%SystemRoot%\explorer.exe "%INSTALL_DIR%"

REM Find Chrome in common locations and open chrome://extensions
set "PF=%ProgramFiles%"
set "PF86=%ProgramFiles(x86)%"
set "CHROME="
if exist "%PF%\Google\Chrome\Application\chrome.exe" set "CHROME=%PF%\Google\Chrome\Application\chrome.exe"
if exist "%PF86%\Google\Chrome\Application\chrome.exe" set "CHROME=%PF86%\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if defined CHROME (
    start "" "%CHROME%" "chrome://extensions"
) else (
    start "" chrome.exe "chrome://extensions" 2>nul
)

echo.
echo   =======================================
echo   SUCCESS! The folder is now open.
echo   =======================================
echo.
echo   In Chrome (chrome://extensions):
echo.
echo   1. Turn ON  Developer mode  (top-right)
echo   2. Click  Load unpacked
echo   3. Select the Auto-Typer folder
echo      (it is open in the other window)
echo.
echo   Or paste this path (Ctrl+V):
echo      %INSTALL_DIR%
echo.
echo   4. Click  Select Folder
echo.
echo   NOTE: Do not delete the Auto-Typer folder.
echo   Chrome loads the extension from there.
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
