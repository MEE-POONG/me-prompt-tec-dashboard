@echo off
echo ========================================
echo Clean Start - Kill all and restart
echo ========================================
echo.

cd /d "d:\PJ\nuy\me-prompt-tec-dashboard"

echo [1/4] Killing all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Removing lock file...
if exist ".next\dev\lock" del /f ".next\dev\lock"

echo [3/4] Clearing .next cache...
if exist ".next" rmdir /s /q ".next"

echo [4/4] Starting server on port 3000...
echo.
echo ========================================
echo Server starting...
echo ========================================
echo.

npm run dev
