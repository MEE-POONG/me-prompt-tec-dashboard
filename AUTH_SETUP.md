# 🔐 Authentication & Authorization System

## สรุประบบที่สร้างขึ้น

ระบบ Authentication และ Authorization แบบสมบูรณ์สำหรับ Next.js Dashboard พร้อม:
- ✅ **JWT Token** - Authentication ด้วย JSON Web Token
- ✅ **httpOnly Cookies** - เก็บ token ใน cookies แบบปลอดภัย (ป้องกัน XSS)
- ✅ **bcrypt** - Hash password แบบปลอดภัย
- ✅ **Role-based Authorization** - จำกัดสิทธิ์ตาม Role (admin, staff, student, viewer)
- ✅ **Middleware** - ตรวจสอบ Authentication อัตโนมัติ

---

## 📁 ไฟล์ที่สร้างขึ้น

### 1. **Utilities**
- `src/lib/auth/jwt.ts` - JWT token utilities (sign, verify, decode)
- `src/lib/auth/password.ts` - Password hashing & validation utilities
- `src/lib/auth/cookies.ts` - httpOnly cookie management

### 2. **Middleware**
- `src/lib/middleware/auth.ts` - Authentication & Authorization middleware
  - `requireAuth()` - ตรวจสอบว่า login หรือไม่
  - `requireRole()` - ตรวจสอบ role
  - `withAuth()` - Helper สำหรับใช้ middleware
  - `withAuthAndRole()` - Helper สำหรับใช้ middleware + role check

### 3. **API Endpoints**
- `src/pages/api/login/login.ts` - Login API (อัปเดตแล้ว)
- `src/pages/api/auth/logout.ts` - Logout API
- `src/pages/api/auth/me.ts` - ดึงข้อมูล user ปัจจุบัน

### 4. **Protected API Examples**
- `src/pages/api/protected/any-logged-in.ts` - API สำหรับทุก role ที่ login แล้ว
- `src/pages/api/protected/staff-or-admin.ts` - API สำหรับ staff และ admin
- `src/pages/api/protected/admin-only.ts` - API สำหรับ admin เท่านั้น

### 5. **Test Page**
- `src/pages/test-auth.tsx` - หน้าทดสอบระบบ Authentication

### 6. **Scripts**
- `scripts/hash-password.ts` - Script สำหรับ hash password

---

## 🚀 การติดตั้งและตั้งค่า

### 1. ติดตั้ง Dependencies (ทำแล้ว ✅)
```bash
npm install jsonwebtoken bcryptjs cookie
npm install -D @types/jsonwebtoken @types/bcryptjs @types/cookie
```

### 2. ตั้งค่า Environment Variables

เพิ่มใน `.env`:
```bash
# JWT Secret (เปลี่ยนเป็นค่าที่ปลอดภัยใน production)
JWT_SECRET=your-super-secret-key-change-this-in-production

# JWT Expiration Time (7 days)
JWT_EXPIRES_IN=7d
```

### 3. Hash Password สำหรับ User ที่มีอยู่แล้ว

ใช้ script hash-password:
```bash
npx tsx scripts/hash-password.ts YourPassword123
```

Output:
```
✅ Hash สำเร็จ!

Password ต้นฉบับ: YourPassword123
Password Hash: $2a$10$abcd...xyz

📝 คัดลอก hash นี้ไปใส่ในฟิลด์ passwordHash ของ User ใน database
```

จากนั้นอัปเดต passwordHash ใน database:
```javascript
// ตัวอย่าง: ใช้ Prisma Studio หรือ MongoDB Compass
{
  "email": "admin@example.com",
  "passwordHash": "$2a$10$abcd...xyz"  // ← ใส่ hash ที่ได้จาก script
}
```

---

## 📚 วิธีใช้งาน

### 1. Login

```typescript
// Frontend
const response = await fetch("/api/login/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "admin@example.com",
    password: "YourPassword123"
  })
});

const data = await response.json();
// Token จะถูกเก็บใน httpOnly cookie อัตโนมัติ
```

### 2. Logout

```typescript
const response = await fetch("/api/auth/logout", {
  method: "POST"
});
```

### 3. ดึงข้อมูล User ปัจจุบัน

```typescript
const response = await fetch("/api/auth/me");
const data = await response.json();

console.log(data.user); // { id, email, name, role, ... }
```

---

## 🛡️ การใช้งาน Middleware

### ตัวอย่างที่ 1: Protected API (ทุก Role ที่ login แล้ว)

```typescript
// pages/api/my-protected-route.ts
import { AuthenticatedRequest, withAuth } from "@/lib/middleware/auth";
import type { NextApiResponse } from "next";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // เข้าถึงได้ทุก role ที่ login แล้ว
  const user = req.user; // มีข้อมูล user อยู่ใน req.user

  return res.status(200).json({
    message: "Hello " + user?.name,
    role: user?.role
  });
}

export default withAuth(handler);
```

### ตัวอย่างที่ 2: Protected API (เฉพาะบาง Role)

```typescript
// pages/api/admin/dashboard.ts
import { AuthenticatedRequest, withAuthAndRole } from "@/lib/middleware/auth";
import type { NextApiResponse } from "next";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // เข้าถึงได้เฉพาะ admin
  return res.status(200).json({
    message: "Welcome Admin!",
    data: { /* admin data */ }
  });
}

// เฉพาะ admin เท่านั้น
export default withAuthAndRole(["admin"], handler);
```

### ตัวอย่างที่ 3: Multiple Roles

```typescript
// เฉพาะ admin และ staff
export default withAuthAndRole(["admin", "staff"], handler);
```

---

## 🎯 Roles ที่รองรับ

ตาม Prisma Schema:
- `admin` - ผู้ดูแลระบบ (สิทธิ์สูงสุด)
- `staff` - พนักงาน
- `student` - นักศึกษา
- `viewer` - ผู้ดูทั่วไป (สิทธิ์จำกัด)

---

## 🧪 การทดสอบ

### 1. ทดสอบผ่านหน้าเว็บ

```bash
npm run dev
```

เปิด: `http://localhost:3000/test-auth`

หน้านี้จะแสดง:
- ✅ ข้อมูล User ปัจจุบัน (ถ้า login แล้ว)
- ✅ ปุ่มทดสอบ Protected APIs ต่างๆ
- ✅ ผลลัพธ์การเรียก API แบบ Real-time

### 2. ทดสอบผ่าน curl

```bash
# Login
curl -X POST http://localhost:3000/api/login/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@example.com","password":"YourPassword123"}' \
  -c cookies.txt

# ดึงข้อมูล User (ใช้ cookies จาก login)
curl http://localhost:3000/api/auth/me -b cookies.txt

# ทดสอบ Protected API
curl http://localhost:3000/api/protected/admin-only -b cookies.txt

# Logout
curl -X POST http://localhost:3000/api/auth/logout -b cookies.txt
```

---

## 🔒 Security Features

### 1. httpOnly Cookies
- Token เก็บใน httpOnly cookie → ไม่สามารถเข้าถึงผ่าน JavaScript
- ป้องกัน XSS attacks

### 2. sameSite Protection
- Cookie ตั้งค่า `sameSite: "lax"`
- ป้องกัน CSRF attacks

### 3. Secure Flag (Production)
- ใน production จะใช้ `secure: true`
- Token ส่งผ่าน HTTPS เท่านั้น

### 4. Password Hashing
- ใช้ bcrypt กับ salt rounds = 10
- Password ไม่เก็บ plain text ใน database

### 5. Token Expiration
- JWT Token หมดอายุภายใน 7 วัน (ตั้งค่าได้)
- User ต้อง login ใหม่เมื่อ token หมดอายุ

---

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "message": "เข้าสู่ระบบสำเร็จ",
  "user": {
    "id": "123",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Error Response - Unauthorized
```json
{
  "error": "UNAUTHORIZED",
  "message": "กรุณาเข้าสู่ระบบ"
}
```

### Error Response - Forbidden
```json
{
  "error": "FORBIDDEN",
  "message": "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้",
  "requiredRoles": ["admin"],
  "yourRole": "staff"
}
```

---

## 🚨 Troubleshooting

### 1. Token ไม่ทำงาน
- ตรวจสอบว่าตั้งค่า `JWT_SECRET` ใน `.env` แล้ว
- Restart dev server

### 2. Login ไม่สำเร็จ
- ตรวจสอบว่า passwordHash ใน database ถูก hash ด้วย bcrypt แล้ว
- ใช้ script `hash-password.ts` เพื่อสร้าง hash ใหม่

### 3. Cookie ไม่ถูกส่ง
- ตรวจสอบว่า Frontend และ Backend อยู่ domain เดียวกัน
- ใน development ต้องใช้ `localhost` ทั้ง 2 ฝั่ง

### 4. 403 Forbidden
- ตรวจสอบว่า User มี role ที่ถูกต้อง
- ตรวจสอบว่า `isActive = true` ใน database

---

## 📝 Best Practices

1. **เปลี่ยน JWT_SECRET** ใน production
2. **ใช้ HTTPS** ใน production
3. **Hash Password** ทุกครั้งก่อนเก็บใน database
4. **Validate Input** ก่อนประมวลผล
5. **Log Failed Login Attempts** เพื่อความปลอดภัย
6. **Implement Rate Limiting** ป้องกัน brute force
7. **Regular Token Rotation** พิจารณาใช้ refresh token

---

## 🎓 เอกสารเพิ่มเติม

- [JWT.io](https://jwt.io/) - เรียนรู้เกี่ยวกับ JWT
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Password hashing
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## ✅ Checklist สำหรับ Production

- [ ] เปลี่ยน `JWT_SECRET` เป็นค่าที่ปลอดภัย
- [ ] ตั้งค่า `secure: true` สำหรับ cookies
- [ ] เปิดใช้งาน HTTPS
- [ ] Hash password ของ User ทุกคน
- [ ] ลบหน้า `/test-auth` หรือจำกัดสิทธิ์
- [ ] Implement rate limiting
- [ ] Setup logging และ monitoring
- [ ] Backup JWT_SECRET อย่างปลอดภัย

---

**เสร็จสมบูรณ์! 🎉** ระบบ Authentication และ Authorization พร้อมใช้งานแล้ว
