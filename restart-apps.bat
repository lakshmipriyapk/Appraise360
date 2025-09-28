@echo off
echo ========================================
echo Restarting Full Stack Application
echo ========================================

echo.
echo Step 1: Stopping any running processes...
taskkill /f /im java.exe 2>nul
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo Step 2: Starting Spring Boot Backend...
start "Backend" cmd /k "cd springapp && mvn spring-boot:run"

echo.
echo Step 3: Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo.
echo Step 4: Starting Angular Frontend...
start "Frontend" cmd /k "cd angularapp && npm start"

echo.
echo ========================================
echo Applications are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:4200
echo ========================================
echo.
echo Press any key to exit...
pause >nul
