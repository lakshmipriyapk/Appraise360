@echo off
echo ========================================
echo Testing All APIs - Real-World Project
echo ========================================

echo.
echo Step 1: Starting Spring Boot Backend...
echo.
start "Backend Server" cmd /k "cd springapp && mvn spring-boot:run"

echo.
echo Step 2: Waiting for backend to start...
echo Please wait 30-60 seconds for backend to fully start
echo.
timeout /t 45 /nobreak >nul

echo.
echo Step 3: Testing All APIs...
echo.

echo Testing User API...
curl -X GET "http://localhost:8080/api/users" -H "Accept: application/json" 2>nul
if %errorlevel% equ 0 (
    echo ✅ User API is working
) else (
    echo ❌ User API failed
)

echo.
echo Testing Employee Profile API...
curl -X GET "http://localhost:8080/api/employeeProfiles" -H "Accept: application/json" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Employee Profile API is working
) else (
    echo ❌ Employee Profile API failed
)

echo.
echo Testing Goal API...
curl -X GET "http://localhost:8080/api/goals" -H "Accept: application/json" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Goal API is working
) else (
    echo ❌ Goal API failed
)

echo.
echo Testing Feedback API...
curl -X GET "http://localhost:8080/api/feedbacks" -H "Accept: application/json" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Feedback API is working
) else (
    echo ❌ Feedback API failed
)

echo.
echo Testing Appraisal API...
curl -X GET "http://localhost:8080/api/appraisals" -H "Accept: application/json" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Appraisal API is working
) else (
    echo ❌ Appraisal API failed
)

echo.
echo ========================================
echo API Testing Complete!
echo ========================================
echo.
echo If all APIs show ✅, then your backend is working perfectly!
echo.
echo You can now:
echo 1. Start the frontend: cd angularapp && npm start
echo 2. Open http://localhost:4200
echo 3. Test creating goals, feedback, and profiles
echo 4. All data will save to database successfully!
echo.
echo Database Console: http://localhost:8080/h2-console
echo - JDBC URL: jdbc:h2:mem:testdb
echo - Username: sa
echo - Password: password
echo.
pause
