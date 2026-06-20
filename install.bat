@echo off
chcp 65001 >nul 2>&1
REM ============================================================
REM  Auto Typer - one-click installer (Windows)
REM  Just double-click this file. No Node.js / npm / build tools.
REM  It downloads scripts/install.ps1 from GitHub and runs it.
REM ============================================================

powershell -ExecutionPolicy Bypass -NoProfile -Command "iwr -UseBasicParsing 'https://raw.githubusercontent.com/20aacht00/auto-typer/main/scripts/install.ps1' | iex"

echo.
pause
