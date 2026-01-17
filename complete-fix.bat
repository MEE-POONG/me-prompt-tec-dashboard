@echo off
echo ========================================
echo Complete Fix - Prisma + SSE Errors
echo ========================================
echo.

REM Change to project directory
cd /d "d:\PJ\nuy\me-prompt-tec-dashboard"

echo Current directory: %CD%
echo.

echo [1/6] Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Cleaning ALL caches...
if exist "node_modules\.prisma" (
    echo Removing node_modules\.prisma...
    rmdir /s /q "node_modules\.prisma"
)
if exist ".next" (
    echo Removing .next...
    rmdir /s /q ".next"
)
if exist ".turbo" (
    echo Removing .turbo...
    rmdir /s /q ".turbo"
)

echo [3/6] Generating Prisma Client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ✗ Prisma generation failed!
    pause
    exit /b 1
)

echo [4/6] Verifying Prisma Client...
if exist "node_modules\.prisma\client" (
    echo ✓ Prisma Client OK!
) else (
    echo ✗ Prisma Client not found!
    pause
    exit /b 1
)

echo [5/6] Clearing browser cache instructions...
echo.
echo ⚠️  IMPORTANT: After server starts, do this in your browser:
echo    1. Press Ctrl + Shift + Delete
echo    2. Clear "Cached images and files"
echo    3. OR just press Ctrl + Shift + R (Hard Refresh)
echo.
timeout /t 3 /nobreak >nul

echo [6/6] Starting development server...
echo.
echo ========================================
echo Server starting...
echo Press Ctrl+C to stop
echo ========================================
echo.

call npm run dev
