/**
 * Script สำหรับ Hash Password
 * ใช้สำหรับสร้าง password hash เพื่อเก็บใน database
 *
 * วิธีใช้:
 * npx tsx scripts/hash-password.ts YourPassword123
 */

import { hashPassword } from "../src/lib/auth/password";

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error("❌ กรุณาระบุ password ที่ต้องการ hash");
    console.log("\nวิธีใช้:");
    console.log("  npx tsx scripts/hash-password.ts YourPassword123");
    process.exit(1);
  }

  console.log("🔐 กำลัง hash password...\n");

  const hashedPassword = await hashPassword(password);

  console.log("✅ Hash สำเร็จ!\n");
  console.log("Password ต้นฉบับ:", password);
  console.log("Password Hash:", hashedPassword);
  console.log("\n📝 คัดลอก hash นี้ไปใส่ในฟิลด์ passwordHash ของ User ใน database");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
