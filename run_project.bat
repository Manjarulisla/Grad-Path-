@echo off
title GradPath Launcher - UFTB
echo =======================================================
echo   GradPath: Smart CGPA Planner and Academic Tracker
echo   University of Frontier Technology, Bangladesh (UFTB)
echo   Department of Cyber Security Engineering
echo   Course: PROG212 Android and Web Development
echo =======================================================
echo.
echo [1/3] Ensuring XAMPP MySQL is active...
start /B "" "E:\XAMPP\mysql\bin\mysqld.exe" --defaults-file="E:\XAMPP\mysql\bin\my.ini" --standalone >nul 2>&1

echo [2/3] Starting GradPath Backend API (Port 5000)...
start "GradPath Backend API" cmd /k "set PATH=%~dp0tools\node;%%PATH%% && cd /d %~dp0backend && node server.js"

ping 127.0.0.1 -n 3 >nul

echo [3/3] Starting GradPath Frontend (Port 5173)...
start "GradPath Frontend" cmd /k "set PATH=%~dp0tools\node;%%PATH%% && cd /d %~dp0frontend && npm run dev -- --host"

ping 127.0.0.1 -n 4 >nul
echo.
echo Launching GradPath in your default browser...
start http://localhost:5173/

echo.
echo =======================================================
echo   GradPath is running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo   Demo Student: 2404031@uftb.ac.bd / Student@12345
echo   Demo Admin:   admin@uftb.ac.bd / Admin@12345
echo =======================================================

