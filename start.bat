@echo off
echo ========================================
echo POS System v2.1 - Quick Start
echo ========================================
echo.

echo Starting Backend Server...
cd backend
start cmd /k "npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
cd ..\frontend
start cmd /k "npm start"

echo.
echo ========================================
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:4200
echo ========================================
echo.
echo Login credentials:
echo   Admin    - username: admin,    password: admin123
echo   Manager  - username: manager,  password: manager123
echo   Cashier  - username: cashier,  password: cashier123
echo ========================================
