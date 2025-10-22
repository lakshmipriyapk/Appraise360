@echo off
echo Testing Signup Functionality Fix
echo ================================

echo.
echo 1. Starting Backend Server...
start "Backend" cmd /k "cd springapp && mvn spring-boot:run"

echo.
echo 2. Waiting for backend to start (30 seconds)...
timeout /t 30 /nobreak > nul

echo.
echo 3. Starting Frontend Server...
start "Frontend" cmd /k "cd angularapp && npm start"

echo.
echo 4. Waiting for frontend to start (30 seconds)...
timeout /t 30 /nobreak > nul

echo.
echo 5. Opening browser to test signup...
start http://localhost:4200/signup

echo.
echo ================================
echo Test Setup Complete!
echo.
echo Instructions:
echo 1. Wait for both servers to fully start
echo 2. Navigate to http://localhost:4200/signup
echo 3. Fill out the signup form with test data:
echo    - Full Name: Test User
echo    - Email: test@example.com
echo    - Phone: 1234567890
echo    - Role: Employee
echo    - Password: Test123
echo    - Confirm Password: Test123
echo 4. Click "Create Account"
echo 5. Verify the user is saved to database
echo.
echo The signup should now work faster and save to database properly!
echo ================================
pause