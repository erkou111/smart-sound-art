@echo off
echo ========================================
echo Smart Sound Art System - Dev Environment Startup
echo ========================================
echo.

echo [1/5] Activating e3pt conda environment...
call conda activate e3pt
if %errorlevel% neq 0 (
    echo Error: Cannot activate e3pt environment
    pause
    exit /b 1
)
echo Success: e3pt environment activated
echo.

echo [2/5] Starting Docker containers...
echo Starting xiaozhi-esp32-server-redis container...
docker start xiaozhi-esp32-server-redis
if %errorlevel% neq 0 (
    echo Warning: Cannot start redis container
)

echo Starting xiaozhi-esp32-server-db container...
docker start xiaozhi-esp32-server-db
if %errorlevel% neq 0 (
    echo Warning: Cannot start db container
)
echo Success: Docker containers started
echo.

echo [3/5] Starting React app...
start "React App" cmd /k "cd /d %~dp0app && call conda activate e3pt && npm install && npm run dev"
echo Success: React app is starting... (http://localhost:8081/)
echo.

echo [4/5] Waiting 3 seconds before starting backend service...
timeout /t 3 /nobreak >nul
echo Starting manager-api backend service...
start "Manager API" cmd /k "cd /d %~dp0cloud\main\manager-api && call conda activate e3pt && mvn spring-boot:run"
echo Success: Backend service is starting...
echo.

echo [5/5] Waiting 5 seconds before starting frontend management...
timeout /t 5 /nobreak >nul
echo Starting manager-web frontend service...
start "Manager Web" cmd /k "cd /d %~dp0cloud\main\manager-web && call conda activate e3pt && npm install && npm run serve"
echo Success: Frontend management is starting... (http://localhost:8001/)
echo.

echo ========================================
echo All services startup completed!
echo ========================================
echo.
echo React Control Interface: http://localhost:8081/
echo Vue Management Backend: http://localhost:8001/
echo.
echo Tips:
echo    - Wait a few minutes for all services to fully start
echo    - Check corresponding terminal windows if any service fails
echo    - Press any key to close this window
echo.
pause >nul