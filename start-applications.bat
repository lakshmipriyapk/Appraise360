@echo off
echo ========================================
echo   Appraise360 - Performance Appraisal
echo ========================================
echo.

echo Starting Spring Boot Backend...
start "Spring Boot Backend" cmd /k "cd springapp && mvn spring-boot:run"

echo Waiting for Spring Boot to start...
timeout /t 15 /nobreak

echo Starting Angular Frontend...
start "Angular Frontend" cmd /k "cd angularapp && ng serve --port 4200"

echo.
echo ========================================
echo   Applications Starting...
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:4200
echo Swagger:  http://localhost:8080/swagger-ui.html
echo.
echo Press any key to exit...
pause > nul
