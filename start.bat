@echo off
title TODO APP LAUNCHER
color 0A

echo ================================
echo   TODO APP LAUNCHER
echo ================================
echo.

echo Port 3001 temizleniyor...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /F /PID %%a 2>nul
timeout /t 2 >nul

echo [1/2] Backend baslatiliyor...
start "Backend Server" cmd /k "cd server && npm run dev"
timeout /t 3 >nul

echo [2/2] Frontend baslatiliyor...
start "Frontend Vite" cmd /k "npm run dev"
timeout /t 8 >nul

echo [3/3] Electron penceresi aciliyor...
cd electron
npm run dev:electron

echo.
echo ================================
echo   Uygulama baslatildi!
echo ================================
pause