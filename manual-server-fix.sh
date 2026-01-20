#!/bin/bash
# คำสั่งสำหรับ SSH เข้า Server และแก้ปัญหาด้วยตัวเอง
# รันคำสั่งนี้บน Server: 49.231.43.177

echo "🔥 ME PROMPT TEC DASHBOARD - MANUAL FIX"
echo "========================================"
echo ""

# หยุดและลบ Container เก่า
echo "1️⃣ Stopping and removing old container..."
docker stop me-prompt-tec-dashboard 2>/dev/null
docker rm me-prompt-tec-dashboard 2>/dev/null

# ลบ Image ทั้งหมด
echo "2️⃣ Removing ALL old images..."
docker rmi -f $(docker images | grep me-prompt-tec-dashboard | awk '{print $3}') 2>/dev/null

# ดึง Image ใหม่
echo "3️⃣ Pulling fresh image from Docker Hub..."
docker pull chunwarayut/me-prompt-tec-dashboard:v0.1.5

# รัน Container ใหม่
echo "4️⃣ Starting new container..."
docker run --name me-prompt-tec-dashboard \
  --restart=always -d -p 7077:3000 \
  -e DATABASE_URL="mongodb+srv://meprompttec_db_user:gdN5PvB8prcMxPC5@cluster0.js2dhmn.mongodb.net/ME0001DB" \
  -e JWT_SECRET="HJDFH3489HF3H483HF834HF" \
  -e NODE_ENV="production" \
  -e CLOUDFLARE_KEY="QZ6TuL-3r02W7wQjQrv5DA" \
  -e CLOUDFLARE_ACCOUNT_ID="39aa4ea3c7a7d766adc4428933324787" \
  -e CLOUDFLARE_API_TOKEN="HQZYfq40lbkXw2hB8Z4u_wR14ZpPl2x_uscraOf0" \
  -e MAIL_USER="siwakorn.pn@rmuti.ac.th" \
  -e MAIL_PASS="svds jjpc yirw aoyo" \
  -e NEXT_PUBLIC_BASE_URL="http://49.231.43.177:7077/" \
  --memory=512m --memory-swap=512m --cpus=1.5 \
  chunwarayut/me-prompt-tec-dashboard:v0.1.5

# ตรวจสอบ
echo ""
echo "5️⃣ Verifying..."
sleep 3
docker ps | grep me-prompt-tec-dashboard

echo ""
echo "✅ DONE! Check: http://49.231.43.177:7077/profile"
echo "The verification badge should be GONE now!"
