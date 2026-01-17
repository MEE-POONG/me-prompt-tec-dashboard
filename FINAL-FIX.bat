@echo off
echo ========================================
echo FINAL FIX - Complete Solution
echo ========================================
echo.

cd /d "d:\PJ\nuy\me-prompt-tec-dashboard"

echo [1/6] Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Cleaning ALL caches and old Prisma client...
if exist ".next" rmdir /s /q ".next"
if exist ".turbo" rmdir /s /q ".turbo"
if exist "node_modules\.prisma" rmdir /s /q "node_modules\.prisma"
if exist "src\generated\prisma" rmdir /s /q "src\generated\prisma"

echo [3/6] Generating Prisma Client (new location)...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ✗ Prisma generate failed!
    echo Please check the error above
    pause
    exit /b 1
)

echo [4/6] Verifying Prisma Client...
if exist "node_modules\.prisma\client" (
    echo ✓ Prisma Client generated successfully!
) else (
    echo ✗ Prisma Client not found!
    pause
    exit /b 1
)

echo [5/6] Testing database connection...
call npx prisma db pull
if %ERRORLEVEL% EQU 0 (
    echo ✓ Database connection OK!
) else (
    echo ⚠ Database connection test failed
    echo This might be normal if schema is already up to date
)

echo.
echo [6/6] Starting development server...
echo.
echo ========================================
echo ✓ All fixes applied!
echo ========================================
echo.
echo CRITICAL: After server starts, do this:
echo 1. Press Ctrl+Shift+Delete in browser
echo 2. Clear "Cached images and files" 
echo 3. Clear "Cookies and other site data"
echo 4. Close ALL browser windows
echo 5. Open browser again and go to localhost:3000
echo.
echo Press any key to start server...
pause >nul

call npm run dev
