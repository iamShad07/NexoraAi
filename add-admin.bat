@echo off
title Nexora AI - Add / Promote Administrator
cd /d "%~dp0server"

set PATH=C:\Users\mdsha\.gemini\antigravity\bin;%PATH%

node scripts/add-admin.js %*

pause
