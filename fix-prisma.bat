@echo off
echo ========================================
echo Fixing Prisma Client Issues
echo ========================================
echo.

REM Change to project directory
cd /d "d:\PJ\nuy\me-prompt-tec-dashboard"

echo Current directory: %CD%
echo.

echo [1/5] Stopping any running dev server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Cleaning Prisma cache...
if exist "node_modules\.prisma" (
    echo Removing node_modules\.prisma...
    rmdir /s /q "node_modules\.prisma"
)
if exist ".next" (
    echo Removing .next...
    rmdir /s /q ".next"
)

echo [3/5] Generating Prisma Client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ✗ Prisma generation failed!
    echo Please check the error above
    pause
    exit /b 1
)

echo [4/5] Verifying Prisma Client...
if exist "node_modules\.prisma\client" (
    echo ✓ Prisma Client generated successfully!
) else (
    echo ✗ Prisma Client not found!
    echo Trying to install dependencies...
    call npm install
    call npx prisma generate
)

echo [5/5] Starting development server...
echo.
echo ========================================
echo All done! Starting dev server...
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev
