@echo off
echo Starting Spring Boot Backend...
echo ================================

cd springapp

echo.
echo 1. Cleaning and compiling...
call mvn clean compile

echo.
echo 2. Building JAR file...
call mvn package -DskipTests

echo.
echo 3. Starting Spring Boot application...
echo Backend will be available at: http://localhost:8080
echo.
java -jar target/springapp-0.0.1-SNAPSHOT.jar

pause
