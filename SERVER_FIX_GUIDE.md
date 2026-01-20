# วิธีแก้ปัญหา Server ไม่อัปเดต - ฉบับสมบูรณ์

## ปัญหา
- ✅ Localhost (3000) ทำงานถูกต้อง - ป้ายหายแล้ว
- ❌ Production (7077) ไม่เปลี่ยนแปลงเลย
- ✅ GitHub Actions แสดง Success
- ❌ แต่ Server ไม่ได้รับการอัปเดต

## สาเหตุที่เป็นไปได้
1. GitHub Actions Deploy ไม่สำเร็จจริง (แม้จะขึ้น Success)
2. Server ไม่มี Permission ดึง Docker Image
3. Docker Cache ติดแน่น
4. Container ไม่ Restart

---

## วิธีแก้ที่ 1: ตรวจสอบ GitHub Actions Log

1. ไปที่ https://github.com/MEE-POONG/me-prompt-tec-dashboard/actions
2. คลิกที่ Workflow ล่าสุด (v0.1.6)
3. ดูที่ขั้นตอน "deploy" → "SSH Deploy"
4. **ตรวจสอบว่ามี Error หรือไม่**

ถ้าเห็น Error ส่งมาให้ผมดู

---

## วิธีแก้ที่ 2: SSH เข้า Server และแก้ด้วยตัวเอง (แนะนำ)

### ขั้นตอนที่ 1: เข้า SSH
```bash
ssh root@49.231.43.177
```

### ขั้นตอนที่ 2: ตรวจสอบสถานะปัจจุบัน
```bash
# ดู Container ที่กำลังรัน
docker ps | grep me-prompt-tec-dashboard

# ดู Image ที่มี
docker images | grep me-prompt-tec-dashboard

# ดู Log ของ Container
docker logs me-prompt-tec-dashboard --tail 50
```

### ขั้นตอนที่ 3: Force Update (คัดลอกทั้งหมดแล้ววาง)
```bash
# หยุดและลบ Container เก่า
docker stop me-prompt-tec-dashboard
docker rm me-prompt-tec-dashboard

# ลบ Image ทั้งหมด (สำคัญมาก!)
docker rmi chunwarayut/me-prompt-tec-dashboard:latest -f
docker rmi chunwarayut/me-prompt-tec-dashboard:v0.1.5 -f
docker rmi chunwarayut/me-prompt-tec-dashboard:v0.1.6 -f
docker rmi $(docker images | grep me-prompt-tec-dashboard | awk '{print $3}') -f

# ดึง Image ใหม่ (ใช้ v0.1.5 ที่เพิ่ง Build)
docker pull chunwarayut/me-prompt-tec-dashboard:v0.1.5

# รัน Container ใหม่
docker run --name me-prompt-tec-dashboard \
  --label io.portainer.accesscontrol.teams=discord \
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
  --log-opt max-size=10m --log-opt max-file=3 \
  chunwarayut/me-prompt-tec-dashboard:v0.1.5

# ลบ Image เก่าที่ไม่ใช้
docker image prune -a -f

# ตรวจสอบว่ารันสำเร็จ
docker ps | grep me-prompt-tec-dashboard
```

### ขั้นตอนที่ 4: ทดสอบ
เปิด http://49.231.43.177:7077/profile

**ต้องเห็น:**
- 🔴 แถบแดง "SYSTEM UPDATED v0.1.6"
- ✅ ไม่มีป้าย "✖ ยังไม่ยืนยันอีเมล"

---

## วิธีแก้ที่ 3: ถ้าไม่มี SSH Access

ถ้าคุณไม่สามารถ SSH เข้า Server ได้:

1. **ติดต่อผู้ดูแล Server** ให้รันคำสั่งข้างบนให้
2. **ใช้ Portainer** (ถ้ามี) ที่ http://49.231.43.177:9000
   - ไปที่ Containers → หา me-prompt-tec-dashboard
   - กด Stop → Remove
   - ไปที่ Images → ลบ Image เก่าทั้งหมด
   - Recreate Container ใหม่

---

## วิธีแก้ที่ 4: ถ้ายังไม่ได้ - ตรวจสอบ GitHub Secrets

ไปที่ GitHub Repository Settings → Secrets and variables → Actions

ตรวจสอบว่ามี Secrets เหล่านี้:
- ✅ SERVER_HOST = 49.231.43.177
- ✅ SERVER_USER = root (หรือ username ที่ใช้)
- ✅ SSH_KEY = Private key สำหรับ SSH
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ DOCKER_USERNAME
- ✅ DOCKER_TOKEN

ถ้าขาดตัวใด GitHub Actions จะ Deploy ไม่สำเร็จ

---

## สรุป: ทำอะไรตอนนี้

**ลำดับความสำคัญ:**

1. ✅ **ลอง SSH เข้า Server แล้วรันคำสั่งในวิธีที่ 2** (แนะนำที่สุด)
2. ✅ ตรวจสอบ GitHub Actions Log (วิธีที่ 1)
3. ✅ ถ้าไม่ได้ทั้ง 2 วิธี → ติดต่อผู้ดูแล Server

---

## หมายเหตุ
- โค้ดในเครื่อง (Localhost) ถูกต้องแล้ว 100%
- ปัญหาอยู่ที่ระบบ Deployment เท่านั้น
- เมื่อแก้ที่ Server เสร็จ ทุกอย่างจะทำงานปกติ
