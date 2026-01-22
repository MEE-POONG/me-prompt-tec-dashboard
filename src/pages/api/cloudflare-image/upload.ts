import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs";
import os from "os";
import path from "path";

// ปิด body parser ของ Next.js เพื่อใช้ formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

interface CloudflareImageResponse {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // 0. ตรวจสอบการเชื่อมต่อ Database ล่วงหน้า เพื่อป้องกัน Prisma Cold Start
    try {
      await prisma.$connect();
      console.log('✅ Prisma connected successfully');
    } catch (prismaError: any) {
      console.error('❌ Prisma connection error:', prismaError.message);
      // ไม่ต้อง return ทันที เพราะอาจจะยังอัปโหลดไป Cloudflare ได้ แต่จะ Save ลง DB ไม่ได้
    }

    // 1. ตรวจสอบว่ามี Environment Variables หรือไม่
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    console.log('--- Upload API Request Started ---');
    console.log('Time:', new Date().toISOString());
    console.log('Environment check:', {
      hasAccountId: !!accountId,
      hasApiToken: !!apiToken,
      accountIdLength: accountId?.length,
    });

    if (!accountId || !apiToken) {
      console.error('❌ Missing Cloudflare credentials');
      return res.status(500).json({
        error: "Cloudflare credentials not configured",
        message: "Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env"
      });
    }

    // 2. จัดการ Upload Directory สำหรับ Windows และ Linux
    let uploadDir = process.env.UPLOAD_DIR;

    if (!uploadDir) {
      // ใน Windows Standalone Mode, os.tmpdir() อาจจะมีปัญหาเรื่อง Permission ในบางครั้ง
      // เราจะลองใช้โฟลเดอร์ temp ภายในโปรเจกต์แทน
      uploadDir = path.join(process.cwd(), 'tmp-uploads');
    }

    console.log('📍 Target upload directory:', uploadDir);

    try {
      if (!fs.existsSync(uploadDir)) {
        console.log('📂 Creating upload directory...');
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('✅ Upload directory created');
      } else {
        // ตรวจสอบว่าเขียนได้จริงไหม (Permission Check)
        const testFile = path.join(uploadDir, `.write-test-${Date.now()}`);
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log('✅ Upload directory is writable');
      }
    } catch (dirError: any) {
      console.error('❌ Directory access error:', dirError.message);
      // ถ้าสร้างไม่ได้จริงๆ ให้ถอยกลับไปใช้ os.tmpdir()
      uploadDir = os.tmpdir();
      console.log('⚠️ Falling back to os.tmpdir():', uploadDir);
    }

    // 3. ตั้งค่า Formidable
    const form = formidable({
      multiples: false,
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    console.log('⏳ Parsing form data...');
    let fields: formidable.Fields;
    let files: formidable.Files;

    try {
      const [parsedFields, parsedFiles] = await form.parse(req);
      fields = parsedFields;
      files = parsedFiles;
      console.log('✅ Form parsed successfully');
    } catch (parseError: any) {
      console.error('❌ Formidable parse error:', parseError.message);
      return res.status(400).json({
        error: "Failed to parse upload form",
        message: parseError.message
      });
    }

    // 4. ดึงข้อมูลไฟล์
    const fileArray = files.file;
    if (!fileArray || (Array.isArray(fileArray) && fileArray.length === 0)) {
      console.error('❌ No file in upload request');
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
    console.log('📄 File info:', {
      originalFilename: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype,
      filepath: file.filepath
    });

    // 5. Metadata จาก form
    const relatedType = fields.relatedType ? String(fields.relatedType[0]) : null;
    const relatedId = fields.relatedId ? String(fields.relatedId[0]) : null;
    const fieldName = fields.fieldName ? String(fields.fieldName[0]) : null;
    let tags: string[] = [];
    try {
      tags = fields.tags ? JSON.parse(String(fields.tags[0])) : [];
    } catch (e) {
      console.warn('⚠️ Failed to parse tags, using empty array');
    }

    // 6. อ่านไฟล์เป็น Buffer และส่งไป Cloudflare
    console.log('⏳ Reading file and uploading to Cloudflare...');
    let fileBuffer: Buffer;
    try {
      fileBuffer = fs.readFileSync(file.filepath);
      console.log(`✅ File read: ${fileBuffer.length} bytes`);
    } catch (readError: any) {
      console.error('❌ File read error:', readError.message);
      return res.status(500).json({
        error: "Internal server error reading uploaded file",
        message: readError.message
      });
    }

    const formData = new FormData();
    // แปลง Buffer เป็น Uint8Array เพื่อให้เข้ากับ Blob ใน Next.js/Node runtime
    const uint8Array = new Uint8Array(fileBuffer);
    const blob = new Blob([uint8Array], { type: file.mimetype || "image/jpeg" });
    formData.append("file", blob, file.originalFilename || "image.jpg");

    const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;

    const cloudflareResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: formData,
    });

    console.log('☁️ Cloudflare response status:', cloudflareResponse.status);

    if (!cloudflareResponse.ok) {
      const errorText = await cloudflareResponse.text();
      console.error("❌ Cloudflare upload error:", errorText);
      try {
        const errorData = JSON.parse(errorText);
        return res.status(cloudflareResponse.status).json({
          error: "Failed to upload to Cloudflare",
          details: errorData
        });
      } catch (e) {
        return res.status(cloudflareResponse.status).json({
          error: "Failed to upload to Cloudflare (Non-JSON response)",
          details: errorText.slice(0, 500)
        });
      }
    }

    const cloudflareData = await cloudflareResponse.json() as CloudflareImageResponse;
    console.log('✅ Cloudflare upload successful:', cloudflareData.result.id);

    // 7. เก็บข้อมูลลงฐานข้อมูล
    console.log('⏳ Saving to database...');
    let imageRecord;
    try {
      imageRecord = await prisma.cloudflareImage.create({
        data: {
          cloudflareId: cloudflareData.result.id,
          filename: file.originalFilename || "unknown",
          publicUrl: cloudflareData.result.variants[0],
          variants: cloudflareData.result.variants,
          size: file.size,
          format: file.mimetype?.split("/")[1] || null,
          relatedType: relatedType || undefined,
          relatedId: relatedId || undefined,
          fieldName: fieldName || undefined,
          tags: tags || [],
          isActive: true,
        },
      });
      console.log('✅ Database record created:', imageRecord.id);
    } catch (dbError: any) {
      console.error('❌ Database save error:', dbError.message);
      return res.status(500).json({
        error: "Failed to save image info to database",
        message: dbError.message,
        cloudflareId: cloudflareData.result.id // ส่งกลับไปเพื่อให้ user รู้ว่ารูปขึ้นไปแล้วแต่ save ไม่ได้
      });
    }

    // 8. ลบไฟล์ temp
    try {
      if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
        console.log('🗑️ Temp file deleted');
      }
    } catch (unlinkError: any) {
      console.warn('⚠️ Failed to delete temp file:', unlinkError.message);
    }

    console.log('--- Upload API Request Finished Successfully ---');
    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: imageRecord,
    });

  } catch (error: any) {
    console.error("❌ UNCAUGHT Upload error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Unknown error",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

