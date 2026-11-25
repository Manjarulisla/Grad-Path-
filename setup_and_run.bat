@echo off
title GradPath - Auto Setup & Launch
echo =======================================================
echo   GradPath: Academic CGPA Tracker & Planner
echo   One-Click Setup and Launcher for Teammates
echo =======================================================
echo.

REM Set node path if tools\node exists
if exist "%~dp0tools\node\node.exe" (
    set "PATH=%~dp0tools\node;%PATH%"
    echo [OK] Using included portable Node.js runtime.
)

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH!
    echo Please install Node.js (v18 or higher) from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [1/4] Ensuring Backend Dependencies...
cd /d "%~dp0backend"
if not exist "node_modules\" (
    echo Installing backend packages (express, mysql2, bcryptjs, etc.)...
    call npm install
) else (
    echo Backend dependencies already installed.
)

echo.
echo [2/4] Ensuring Frontend Dependencies...
cd /d "%~dp0frontend"
if not exist "node_modules\" (
    echo Installing frontend packages (react, vite, tailwind, etc.)...
    call npm install
) else (
    echo Frontend dependencies already installed.
)

echo.
echo [3/4] Launching GradPath Backend Server (Port 5000)...
start "GradPath Backend API" cmd /k "cd /d %~dp0backend && node server.js"

ping 127.0.0.1 -n 3 >nul

echo.
echo [4/4] Launching GradPath Frontend Server (Port 5173)...
start "GradPath Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host"

ping 127.0.0.1 -n 3 >nul

echo.
echo Launching GradPath in your default web browser...
start http://localhost:5173/

echo.
echo =======================================================
echo   GradPath is successfully running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo   
echo   Login for Tamim:
echo   ID/Email: 2404026@uftb.ac.bd (or 2404026)
echo   Password: Student@12345
echo =======================================================
