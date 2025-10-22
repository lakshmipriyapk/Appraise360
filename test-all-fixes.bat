@echo off
echo Testing All Fixes - Signup, Employee Profile, and Goal Form
echo ============================================================

echo.
echo 1. Starting Backend Server...
start "Backend" cmd /k "cd springapp && java -jar target/springapp-0.0.1-SNAPSHOT.jar"

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
echo 5. Opening browser to test all fixes...
start http://localhost:4200/signup

echo.
echo ============================================================
echo All Fixes Test Setup Complete!
echo.
echo FIXES IMPLEMENTED:
echo ==================
echo.
echo 1. SIGNUP FIXES:
echo    ✅ Removed health check on component init (faster loading)
echo    ✅ Reduced timeout from 10s to 5s
echo    ✅ Fixed User model to use EAGER fetching
echo    ✅ Fixed UserService to properly initialize employeeProfiles
echo    ✅ Simplified data-init.sql to avoid ID conflicts
echo.
echo 2. EMPLOYEE PROFILE FIXES:
echo    ✅ Added role-based filtering to show only employees
echo    ✅ Excluded admin users from employee profile list
echo    ✅ Added backend endpoint /api/users/role/{role}
echo.
echo 3. GOAL FORM FIXES:
echo    ✅ Fixed employee selection to work like feedback form
echo    ✅ Added role-based filtering for employee dropdown
echo    ✅ Ensured only employees are shown in goal creation
echo.
echo 4. FEEDBACK FORM FIXES:
echo    ✅ Added role-based filtering for employee selection
echo    ✅ Ensured consistency across all admin components
echo.
echo TESTING INSTRUCTIONS:
echo =====================
echo.
echo 1. SIGNUP TEST:
echo    - Navigate to http://localhost:4200/signup
echo    - Fill out the form with test data:
echo      * Full Name: Test User
echo      * Email: test@example.com
echo      * Phone: 1234567890
echo      * Role: Employee
echo      * Password: Test123
echo      * Confirm Password: Test123
echo    - Click "Create Account"
echo    - Verify: Should work faster and save to database
echo.
echo 2. EMPLOYEE PROFILE TEST:
echo    - Navigate to http://localhost:4200/admin-dashboard
echo    - Click on "Employee Profile"
echo    - Verify: Only employees should be visible (no admin users)
echo.
echo 3. GOAL FORM TEST:
echo    - Navigate to http://localhost:4200/goal
echo    - Click "Create Goal"
echo    - Verify: Employee dropdown should show employees only
echo    - Fill out the form and create a goal
echo    - Verify: Goal should be saved to database
echo.
echo 4. FEEDBACK FORM TEST:
echo    - Navigate to http://localhost:4200/feedback
echo    - Click "Create Feedback"
echo    - Verify: Employee selection should work properly
echo    - Fill out the form and create feedback
echo    - Verify: Feedback should be saved to database
echo.
echo ============================================================
echo All fixes have been implemented and committed to GitHub!
echo ============================================================
pause
