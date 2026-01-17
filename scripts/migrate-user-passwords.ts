/**
 * Script สำหรับ Migrate Password ที่เป็น plain text ให้เป็น bcrypt hash
 *
 * วิธีใช้:
 * 1. แก้ไข plainTextPassword ในโค้ดตามจริง (หรือส่งผ่าน argument)
 * 2. รัน: npx tsx scripts/migrate-user-passwords.ts
 */

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

async function migratePasswords() {
  console.log("🔐 เริ่มต้น Migrate User Passwords...\n");

  try {
    // ดึง Users ทั้งหมด
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
      },
    });

    console.log(`📊 พบ ${users.length} users ในระบบ\n`);

    for (const user of users) {
      console.log(`👤 Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Current passwordHash: ${user.passwordHash.substring(0, 20)}...`);

      // ตรวจสอบว่าเป็น bcrypt hash หรือไม่
      // bcrypt hash จะขึ้นต้นด้วย $2a$ หรือ $2b$
      const isBcryptHash = user.passwordHash.startsWith("$2a$") || user.passwordHash.startsWith("$2b$");

      if (isBcryptHash) {
        console.log(`   ✅ Already hashed with bcrypt\n`);
      } else {
        console.log(`   ⚠️  NOT a bcrypt hash - ต้อง hash ใหม่`);
        console.log(`   💡 กรุณารัน: npx tsx scripts/hash-password.ts <password-ของ-${user.email}>\n`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📝 วิธีการอัพเดท Password:");
    console.log("=".repeat(60));
    console.log("\n1. รัน script hash-password:");
    console.log("   npx tsx scripts/hash-password.ts <password-ที่ต้องการ>");
    console.log("\n2. คัดลอก hash ที่ได้");
    console.log("\n3. อัพเดทใน database (เลือกวิธีใดวิธีหนึ่ง):");
    console.log("\n   วิธีที่ 1 - ใช้ MongoDB Compass:");
    console.log("   - เปิด MongoDB Compass");
    console.log("   - เชื่อมต่อกับ database");
    console.log("   - หา User collection");
    console.log("   - แก้ไขฟิลด์ passwordHash");
    console.log("\n   วิธีที่ 2 - ใช้ Prisma Studio:");
    console.log("   - รัน: npx prisma studio");
    console.log("   - เปิด User model");
    console.log("   - แก้ไขฟิลด์ passwordHash");
    console.log("\n   วิธีที่ 3 - ใช้ Script (สำหรับ Dev):");
    console.log("   - สร้าง script update-password.ts");
    console.log("   - ระบุ email และ hash ที่ต้องการอัพเดท");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migratePasswords();
