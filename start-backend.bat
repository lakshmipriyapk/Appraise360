@echo off
echo Starting Spring Boot Backend...
cd springapp
echo.
echo Make sure MySQL is running on localhost:3306
echo Database: springapp
echo Username: root
echo Password: root
echo.
echo Starting Spring Boot application on port 8080...
mvn spring-boot:run
pause
