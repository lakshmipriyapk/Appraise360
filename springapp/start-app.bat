@echo off
echo Starting Spring Boot Application...
echo This will keep the application running automatically.
echo Press Ctrl+C to stop.

:start
mvn spring-boot:run
echo Application stopped. Restarting in 5 seconds...
timeout /t 5 /nobreak > nul
goto start
