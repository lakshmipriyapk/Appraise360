@echo off
echo ========================================
echo Starting Production Performance Appraisal System
echo ========================================

echo.
echo Step 1: Checking MySQL Database...
echo Please ensure MySQL is running on localhost:3306
echo Database: springapp
echo Username: root
echo Password: root
echo.
pause

echo.
echo Step 2: Starting Spring Boot Backend...
echo This will create database tables automatically
echo.
start "Backend Server" cmd /k "cd springapp && mvn spring-boot:run"

echo.
echo Step 3: Waiting for backend to start...
echo Please wait 30-60 seconds for backend to fully start
echo.
timeout /t 30 /nobreak >nul

echo.
echo Step 4: Starting Angular Frontend...
echo.
start "Frontend Server" cmd /k "cd angularapp && npm start"

echo.
echo ========================================
echo Production System Started!
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:4200
echo.
echo Test URLs:
echo - Backend API: http://localhost:8080/api/users
echo - Frontend App: http://localhost:4200
echo.
echo Database Tables Created:
echo - user (User accounts)
echo - employee_profile (Employee information)  
echo - goal (Employee goals)
echo - feedback (Employee feedback)
echo - appraisal (Performance appraisals)
echo.
echo Expected Results:
echo - Goals save to database successfully
echo - Feedback saves to database successfully
echo - Profile saves to database successfully
echo - No more "saved locally" messages
echo.
echo Press any key to exit...
pause >nul
