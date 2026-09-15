@echo off
title Nexora AI - Stop Service
echo ===================================================
echo   NEXORA AI - Stopping Services
echo ===================================================

echo Checking for processes on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    echo Stopping process PID: %%a ...
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%b in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Stopping dev server PID: %%b ...
    taskkill /F /PID %%b >nul 2>&1
)

echo ===================================================
echo [SUCCESS] Nexora AI services have been stopped.
echo ===================================================
timeout /t 3 >nul
