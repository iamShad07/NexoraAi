@echo off
title Nexora AI - Background Service
cd /d "%~dp0server"

echo ===================================================
echo   NEXORA AI - Starting 24/7 Full-Stack Service
echo   "Turn Documents Into Knowledge."
echo ===================================================

set PATH=C:\Users\mdsha\.gemini\antigravity\bin;%PATH%

:: Ensure production client is built
if not exist "..\client\dist\index.html" (
    echo Building frontend production assets...
    cd ..\client
    call npm run build
    cd ..\server
)

echo Starting Nexora AI Server on http://localhost:5000 ...
start /B node src/index.js > nexora.log 2>&1

echo.
echo ===================================================
echo [SUCCESS] Nexora AI is now running in the background!
echo - Web App & Admin: http://localhost:5000
echo - Super Admin: mdshadalam848@gmail.com / Nexor@Ai
echo - Logs: server\nexora.log
echo ===================================================
timeout /t 3 >nul
