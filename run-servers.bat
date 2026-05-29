@echo off
echo Starting Mall Management System...
echo.
echo ============================================
echo Backend Server (Port 3000)
echo ============================================
start cmd /k "cd /d "%~dp0" && npm run dev:api"
echo.
timeout /t 3
echo.
echo ============================================
echo Frontend Server (Port 5173)
echo ============================================
start cmd /k "cd /d "%~dp0" && npm run dev"
echo.
echo ============================================
echo Both servers are starting...
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3000
echo ============================================
