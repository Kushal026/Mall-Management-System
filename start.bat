@echo off
REM Mall Management System Startup Script
REM This script starts both the backend and frontend servers

echo.
echo ===============================================
echo   SMART MALL MANAGEMENT SYSTEM
echo ===============================================
echo.
echo Starting services...
echo.

REM Start Backend on Port 4000
echo [1/2] Starting Backend API Server (Port 4000)...
start "Backend Server" cmd /k "cd /d "%CD%" && npm run dev:api"

REM Wait a bit for backend to start
timeout /t 5

REM Start Frontend on Port 5173
echo [2/2] Starting Frontend Server (Port 5173)...
start "Frontend Server" cmd /k "cd /d "%CD%" && npm run dev"

echo.
echo ===============================================
echo   SERVERS STARTING...
echo ===============================================
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:4000
echo.
echo Please wait for both servers to fully start...
echo.
timeout /t 3
