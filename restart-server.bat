@echo off
echo ========================================
echo Clearing Cache and Restarting Server
echo ========================================
echo.

cd /d "d:\PJ\nuy\me-prompt-tec-dashboard"

echo [1/3] Clearing all caches...
if exist ".next" (
    echo Removing .next...
    rmdir /s /q ".next"
)
if exist ".turbo" (
    echo Removing .turbo...
    rmdir /s /q ".turbo"
)
if exist "node_modules\.cache" (
    echo Removing node_modules\.cache...
    rmdir /s /q "node_modules\.cache"
)

echo.
echo [2/3] Verifying Prisma Client...
if exist "node_modules\.prisma\client" (
    echo ✓ Prisma Client exists
) else (
    echo ✗ Prisma Client not found! Running generate...
    call npx prisma generate
)

echo.
echo [3/3] Starting development server...
echo.
echo ========================================
echo Server starting...
echo ========================================
echo.
echo REMEMBER: Clear browser cache!
echo 1. Press Ctrl+Shift+Delete
echo 2. Clear cache and cookies
echo 3. Close and reopen browser
echo.

call npm run dev
