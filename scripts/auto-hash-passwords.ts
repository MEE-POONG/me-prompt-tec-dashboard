/**
 * Script สำหรับ Hash Password แบบอัตโนมัติ
 * จะ hash password ที่เป็น plain text ทั้งหมดในระบบ
 *
 * ⚠️ คำเตือน: Script นี้จะใช้ password เดิมที่เป็น plain text ใน database
 * มา hash แล้วเก็บทับกลับเข้าไป
 *
 * วิธีใช้:
 * npx tsx scripts/auto-hash-passwords.ts
 */

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

async function autoHashPasswords() {
  console.log("🔐 เริ่มต้น Auto Hash User Passwords...\n");

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

    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // ตรวจสอบว่าเป็น bcrypt hash หรือไม่
      const isBcryptHash = user.passwordHash.startsWith("$2a$") || user.passwordHash.startsWith("$2b$");

      if (isBcryptHash) {
        console.log(`✅ ${user.email} - Already hashed, skipped`);
        skippedCount++;
      } else {
        console.log(`🔄 ${user.email} - Hashing plain text password...`);

        // Hash password (ใช้ password เดิมที่เป็น plain text)
        const plainPassword = user.passwordHash;
        const hashedPassword = await hashPassword(plainPassword);

        // อัพเดทใน database
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: hashedPassword },
        });

        console.log(`   ✅ Updated successfully`);
        console.log(`   📝 Email: ${user.email}`);
        console.log(`   🔑 Password: ${plainPassword}`);
        console.log(`   🔒 Hash: ${hashedPassword.substring(0, 30)}...\n`);

        updatedCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Summary:");
    console.log("=".repeat(60));
    console.log(`✅ Updated: ${updatedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users (already hashed)`);
    console.log(`📝 Total: ${users.length} users`);
    console.log("\n🎉 เสร็จสิ้น! ตอนนี้สามารถ login ได้แล้ว\n");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

autoHashPasswords();
