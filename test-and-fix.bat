@echo off
echo ========================================
echo Testing Database Connection
echo ========================================
echo.

REM Change to project directory
cd /d "d:\PJ\nuy\me-prompt-tec-dashboard"

echo [1/4] Testing database connection...
call npx prisma db pull
if %ERRORLEVEL% EQU 0 (
    echo ✓ Database connection OK!
) else (
    echo ✗ Database connection FAILED!
    echo.
    echo Please check:
    echo 1. MongoDB server is running
    echo 2. DATABASE_URL in .env is correct
    echo 3. Network connection is stable
    echo.
    pause
    exit /b 1
)

echo.
echo [2/4] Cleaning caches...
if exist ".next" rmdir /s /q ".next"
if exist "node_modules\.prisma" rmdir /s /q "node_modules\.prisma"

echo.
echo [3/4] Generating Prisma Client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Prisma generate failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Starting development server...
echo.
echo ========================================
echo All checks passed!
echo Starting server...
echo ========================================
echo.
echo IMPORTANT: After server starts:
echo 1. Press Ctrl+Shift+Delete in browser
echo 2. Clear cache and cookies
echo 3. Refresh the page (Ctrl+Shift+R)
echo.

call npm run dev
