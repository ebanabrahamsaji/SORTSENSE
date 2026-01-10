@echo off
echo ============================================
echo      SortSense Local AI System
echo ============================================

echo [Step 1] Checking Node Modules...
if not exist "node_modules" (
    echo Installing Node dependencies...
    call npm install
)

echo [Step 2] Checking Python Dependencies...
pip install -r ml\requirements.txt --only-binary :all: --prefer-binary

echo [Step 3] Starting Python AI Service (Port 5000)...
start "SortSense AI (Python)" python ml\api.py

echo [Step 4] Starting Node Backend (Port 8000)...
start "SortSense Backend (Node)" node server.js

echo.
echo ============================================
echo      SYSTEM RUNNING
echo ============================================
echo 1. Servers are running in the background.
echo 2. Open 'simple_frontend.html' to test.
echo.
pause
