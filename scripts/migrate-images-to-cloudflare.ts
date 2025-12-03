/**
 * Script สำหรับ Migrate รูปภาพจาก base64 ใน database ไปยัง Cloudflare Images
 *
 * วิธีใช้:
 * 1. ตั้งค่า CLOUDFLARE_ACCOUNT_ID และ CLOUDFLARE_API_TOKEN ใน .env
 * 2. รัน: npx tsx scripts/migrate-images-to-cloudflare.ts
 */

import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

interface CloudflareUploadResponse {
  result: {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
  };
  success: boolean;
  errors: any[];
  messages: any[];
}

async function uploadBase64ToCloudflare(
  base64String: string,
  filename: string
): Promise<CloudflareUploadResponse | null> {
  try {
    // แปลง base64 เป็น Buffer
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // สร้าง FormData
    const formData = new FormData();
    const blob = new Blob([buffer], { type: "image/jpeg" });
    formData.append("file", blob, filename);

    // อัพโหลดไปยัง Cloudflare
    const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudflare upload error:", errorData);
      return null;
    }

    const data: CloudflareUploadResponse = await response.json();
    return data.success ? data : null;
  } catch (error) {
    console.error("Error uploading to Cloudflare:", error);
    return null;
  }
}

async function migrateProjectImages() {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    console.error("❌ กรุณาตั้งค่า CLOUDFLARE_ACCOUNT_ID และ CLOUDFLARE_API_TOKEN ใน .env");
    process.exit(1);
  }

  console.log("🚀 เริ่มต้น Migrate รูปภาพ Projects...\n");

  // ดึง Projects ที่มี cover เป็น base64
  const projects = await prisma.project.findMany({
    where: {
      cover: {
        contains: "data:image",
      },
    },
  });

  console.log(`📊 พบ ${projects.length} projects ที่ต้อง migrate\n`);

  let successCount = 0;
  let failCount = 0;

  for (const project of projects) {
    console.log(`📦 กำลัง migrate: ${project.title} (ID: ${project.id})`);

    if (!project.cover) continue;

    try {
      // อัพโหลดไปยัง Cloudflare
      const filename = `project-${project.slug}-cover.jpg`;
      const cloudflareResult = await uploadBase64ToCloudflare(
        project.cover,
        filename
      );

      if (!cloudflareResult) {
        console.log(`   ❌ ล้มเหลว: ไม่สามารถอัพโหลดไปยัง Cloudflare ได้\n`);
        failCount++;
        continue;
      }

      // บันทึกข้อมูลรูปภาพลง CloudflareImage model
      const imageRecord = await prisma.cloudflareImage.create({
        data: {
          cloudflareId: cloudflareResult.result.id,
          filename: filename,
          publicUrl: cloudflareResult.result.variants[0],
          variants: cloudflareResult.result.variants,
          relatedType: "project",
          relatedId: project.id,
          fieldName: "cover",
          tags: ["migrated", "project", "cover"],
          isActive: true,
        },
      });

      // อัพเดท Project ให้ใช้ URL จาก Cloudflare แทน base64
      await prisma.project.update({
        where: { id: project.id },
        data: {
          cover: imageRecord.publicUrl,
        },
      });

      console.log(`   ✅ สำเร็จ: ${imageRecord.publicUrl}\n`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ ล้มเหลว: ${error instanceof Error ? error.message : "Unknown error"}\n`);
      failCount++;
    }
  }

  console.log("\n🎉 เสร็จสิ้นการ Migrate!");
  console.log(`✅ สำเร็จ: ${successCount} projects`);
  console.log(`❌ ล้มเหลว: ${failCount} projects`);

  await prisma.$disconnect();
}

// รัน script
migrateProjectImages().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
