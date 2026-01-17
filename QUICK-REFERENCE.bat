@echo off
REM Quick reference script for common tasks

echo ========================================
echo ME Prompt Tec Dashboard - Quick Commands
echo ========================================
echo.
echo 1. Start Development Server
echo    npm run dev
echo.
echo 2. Generate Prisma Client
echo    npx prisma generate
echo.
echo 3. Clear Cache and Restart
echo    restart-server.bat
echo.
echo 4. Complete Fix (if errors occur)
echo    FINAL-FIX.bat
echo.
echo 5. Database Operations
echo    npx prisma studio          (Open Prisma Studio)
echo    npx prisma db push         (Push schema changes)
echo.
echo ========================================
echo Current Status: Server running on port 3001
echo Access at: http://localhost:3001
echo ========================================
pause
