@echo off
echo Starting Full Stack Application...
echo ==================================

echo.
echo 1. Starting Backend Server...
start "Backend Server" cmd /k "start-backend.bat"

echo.
echo 2. Waiting for backend to start (30 seconds)...
timeout /t 30 /nobreak > nul

echo.
echo 3. Starting Frontend Server...
start "Frontend Server" cmd /k "start-frontend.bat"

echo.
echo 4. Waiting for frontend to start (30 seconds)...
timeout /t 30 /nobreak > nul

echo.
echo 5. Opening browser...
start http://localhost:4200

echo.
echo ==================================
echo Application Started Successfully!
echo ==================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:4200
echo.
echo Test the signup functionality at: http://localhost:4200/signup
echo.
pause
