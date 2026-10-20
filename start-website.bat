@echo off
title NexuStore Unified Launcher
echo ========================================================
echo        Starting NexuStore Unified Full-Stack App
echo ========================================================
echo.

echo [1/2] Checking MongoDB Service...
sc query MongoDB | find "RUNNING" >nul
if %ERRORLEVEL% NEQ 0 (
    echo Starting MongoDB service...
    net start MongoDB
) else (
    echo MongoDB is running.
)

echo.
echo [2/2] Starting NexuStore Unified Server (Port 5000)...
start "NexuStore Server" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 3 /nobreak >nul

echo.
echo Opening NexuStore in your default browser...
start http://localhost:5000/

echo.
echo ========================================================
echo   NexuStore is running successfully on a SINGLE LINK!
echo   Unified Web Store:   http://localhost:5000/
echo   Protected Admin:     http://localhost:5000/admin
echo   Live REST API:       http://localhost:5000/api/status
echo ========================================================
pause
