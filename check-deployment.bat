@echo off
chcp 65001 >nul
echo ====================================
echo 🔍 ตรวจสอบสถานะการ Deploy
echo ====================================
echo.

echo [1/5] ตรวจสอบ Git Status...
git status
echo.

echo [2/5] ตรวจสอบ Commit ล่าสุด...
git log -1 --oneline
echo.

echo [3/5] ตรวจสอบ Branch...
git branch --show-current
echo.

echo [4/5] ตรวจสอบว่ามีการเปลี่ยนแปลงที่ยังไม่ได้ push หรือไม่...
git status --porcelain
if %ERRORLEVEL% EQU 0 (
    echo ✅ ไม่มีการเปลี่ยนแปลงที่รอ commit
) else (
    echo ⚠️ มีไฟล์ที่ยังไม่ได้ commit/push
)
echo.

echo [5/5] แสดงข้อมูล Remote Repository...
git remote -v
echo.

echo ====================================
echo 📋 สิ่งที่ต้องทำต่อ:
echo ====================================
echo 1. ถ้ามีไฟล์ที่ยังไม่ได้ commit ให้รัน:
echo    git add .
echo    git commit -m "Your message"
echo    git push origin master
echo.
echo 2. ตรวจสอบ GitHub Actions ที่:
echo    https://github.com/MEE-POONG/me-prompt-tec-dashboard/actions
echo.
echo 3. รอให้ workflow รันเสร็จ (ประมาณ 3-5 นาที)
echo.
echo 4. ถ้า workflow สำเร็จแล้ว แต่ production ยังไม่อัพเดต
echo    ให้ hard refresh browser: Ctrl + Shift + R
echo.
echo 5. ถ้ายังไม่ได้ ให้ SSH เข้า server และ force restart
echo    (ดูรายละเอียดใน deployment-troubleshooting.md)
echo.

pause
