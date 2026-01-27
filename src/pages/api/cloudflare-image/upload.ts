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
    }

    // 1. ตรวจสอบว่ามี Environment Variables หรือไม่
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    console.log('--- Upload API Request Started ---');
    console.log('Time:', new Date().toISOString());

    if (!accountId || !apiToken) {
      console.error('❌ Missing Cloudflare credentials');
      return res.status(500).json({
        error: "Cloudflare credentials not configured",
        message: "Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env"
      });
    }

    // 2. จัดการ Upload Directory (ใช้ /tmp เป็นมาตรฐานสำหรับ Linux/Docker)
    let uploadDir = process.env.UPLOAD_DIR || path.join(os.tmpdir(), 'me-prompt-uploads');

    console.log('📍 Target upload directory:', uploadDir);

    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('✅ Upload directory created');
      }
    } catch (dirError: any) {
      console.warn('⚠️ Directory access error, falling back to os.tmpdir():', dirError.message);
      uploadDir = os.tmpdir();
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
      name: file.originalFilename,
      path: file.filepath
    });

    // 5. Metadata จาก form
    const relatedType = fields.relatedType ? String(fields.relatedType[0]) : null;
    const relatedId = fields.relatedId ? String(fields.relatedId[0]) : null;
    const fieldName = fields.fieldName ? String(fields.fieldName[0]) : null;
    let tags: string[] = [];
    try {
      tags = fields.tags ? JSON.parse(String(fields.tags[0])) : [];
    } catch (e) {
      console.warn('⚠️ Failed to parse tags');
    }

    // 6. อ่านไฟล์และส่งไป Cloudflare (พร้อมระบบ Retry)
    console.log('⏳ Reading file and uploading to Cloudflare...');
    let fileBuffer: Buffer;
    try {
      fileBuffer = fs.readFileSync(file.filepath);
    } catch (readError: any) {
      console.error('❌ File read error:', readError.message);
      return res.status(500).json({
        error: "Internal server error reading uploaded file",
        message: readError.message
      });
    }

    const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;
    console.log(`☁️ Uploading to: ${uploadUrl}`);

    // Helper function สำหรับ Cloudflare Upload พร้อม Retry
    const uploadToCloudflareWithRetry = async (retries = 2, delay = 1000): Promise<Response> => {
      for (let i = 0; i < retries; i++) {
        try {
          const formData = new FormData();
          const uint8Array = new Uint8Array(fileBuffer);
          const blob = new Blob([uint8Array], { type: file.mimetype || "image/jpeg" });
          formData.append("file", blob, file.originalFilename || "image.jpg");

          console.log(`🔄 Attempt ${i + 1}/${retries}: Sending fetch request...`);

          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiToken}` },
            body: formData,
            // @ts-ignore - Required for Node.js fetch with body
            duplex: "half",
          });

          if (response.ok || i === retries - 1) return response;

          console.warn(`⚠️ Cloudflare upload retry ${i + 1}/${retries} after failure. Status: ${response.status}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } catch (err: any) {
          console.error(`❌ Cloudflare fetch error (Attempt ${i + 1}/${retries}):`, {
            message: err.message,
            cause: err.cause,
            code: err.code,
            stack: err.stack
          });

          if (i === retries - 1) {
            // Throw enhanced error for final catch block
            const enhancedError: any = new Error(`Cloudflare fetch failed: ${err.message}`);
            enhancedError.cause = err.cause;
            enhancedError.code = err.code;
            throw enhancedError;
          }
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      throw new Error("Failed after all retries");
    };

    let cloudflareResponse;
    try {
      cloudflareResponse = await uploadToCloudflareWithRetry();
    } catch (uploadErr: any) {
      console.error("🔥 Final Upload Error:", uploadErr);
      return res.status(500).json({
        error: "Critical Upload Failure",
        message: uploadErr.message,
        cause: uploadErr.cause ? String(uploadErr.cause) : undefined,
        code: uploadErr.code,
        details: "Network/Fetch error connecting to Cloudflare"
      });
    }
    console.log('☁️ Cloudflare response status:', cloudflareResponse.status);

    if (!cloudflareResponse.ok) {
      const errorText = await cloudflareResponse.text();
      console.error("❌ Cloudflare upload error:", errorText);
      return res.status(cloudflareResponse.status).json({
        error: "Failed to upload to Cloudflare",
        details: errorText.slice(0, 500)
      });
    }

    const cloudflareData = await cloudflareResponse.json() as CloudflareImageResponse;
    console.log('✅ Cloudflare upload successful');

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
          format: file.mimetype?.split("/")[1] || "unknown",
          ...(relatedType && { relatedType }),
          ...(relatedId && { relatedId }),
          ...(fieldName && { fieldName }),
          tags: tags || [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (dbError: any) {
      console.error('❌ Database save error:', dbError.message);
      return res.status(500).json({
        error: "Failed to save image info to database",
        message: dbError.message
      });
    }

    // 8. ลบไฟล์ temp
    try {
      if (fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
    } catch (unlinkError: any) {
      console.warn('⚠️ Temp cleanup error:', unlinkError.message);
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
      cause: error.cause ? String(error.cause) : undefined // Add cause for debugging
    });
  }
}


