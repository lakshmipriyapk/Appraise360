@echo off
echo Starting Angular Frontend...
echo ============================

cd angularapp

echo.
echo 1. Installing dependencies (if needed)...
call npm install

echo.
echo 2. Starting Angular development server...
echo Frontend will be available at: http://localhost:4200
echo.
call npm start

pause
