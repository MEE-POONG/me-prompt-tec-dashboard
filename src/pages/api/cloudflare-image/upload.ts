import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs";
import os from "os";

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
    // ตรวจสอบว่ามี Environment Variables หรือไม่
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    console.log('Upload API called');
    console.log('Environment check:', {
      hasAccountId: !!accountId,
      hasApiToken: !!apiToken,
      accountIdLength: accountId?.length,
    });

    if (!accountId || !apiToken) {
      console.error('Missing Cloudflare credentials');
      return res.status(500).json({
        error: "Cloudflare credentials not configured",
        message: "Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env"
      });
    }

    // Parse form data with formidable
    // กำหนด Upload Directory ให้ชัดเจน
    // ใน Vercel/Docker environment ควรใช้ /tmp หรือ path ที่เขียนได้
    const isWindows = os.platform() === 'win32';
    const uploadDir = process.env.UPLOAD_DIR || (isWindows ? os.tmpdir() : '/tmp');

    console.log('Setup upload directory:', uploadDir);

    // Ensure upload dir exists with proper permissions
    try {
      if (!fs.existsSync(uploadDir)) {
        console.log('Creating upload directory...');
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
      } else {
        // ตรวจสอบว่าเขียนได้ไหม
        fs.accessSync(uploadDir, fs.constants.W_OK);
      }
    } catch (err: any) {
      console.error('Failed to access/create upload directory:', err);
      // Fallback to os.tmpdir() if custom path fails
      console.log('Falling back to os.tmpdir()');
    }

    const form = formidable({
      multiples: false,
      uploadDir: fs.existsSync(uploadDir) ? uploadDir : os.tmpdir(), // Safety fallback
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filename: (name, ext, part, form) => {
        // สร้างชื่อไฟล์ที่ปลอดภัยและไม่ซ้ำกัน
        const timestamp = Date.now();
        const safeName = part.originalFilename?.replace(/[^a-z0-9.]/gi, '_') || 'unknown';
        return `${timestamp}_${safeName}`;
      }
    });

    console.log('Parsing form data (v3 style)...');
    const [fields, files] = await form.parse(req);
    console.log('Form parsed successfully');
    console.log('Fields:', Object.keys(fields));
    console.log('Files:', Object.keys(files));

    // ดึงข้อมูลไฟล์
    const fileArray = files.file;
    if (!fileArray || fileArray.length === 0) {
      console.error('No file in upload request');
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
    console.log('File info:', {
      filename: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype,
      filepath: file.filepath
    });

    // Metadata จาก form
    const relatedType = fields.relatedType ? String(fields.relatedType[0]) : null;
    const relatedId = fields.relatedId ? String(fields.relatedId[0]) : null;
    const fieldName = fields.fieldName ? String(fields.fieldName[0]) : null;
    const tags = fields.tags ? JSON.parse(String(fields.tags[0])) : [];

    // อ่านไฟล์เป็น Buffer
    console.log('Reading file buffer...');
    const fileBuffer = fs.readFileSync(file.filepath);
    console.log('File buffer size:', fileBuffer.length);

    // สร้าง FormData สำหรับส่งไปยัง Cloudflare
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: file.mimetype || "image/jpeg" });
    formData.append("file", blob, file.originalFilename || "image.jpg");

    // อัพโหลดไปยัง Cloudflare Images
    const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;
    console.log('Uploading to Cloudflare...');

    const cloudflareResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: formData,
    });

    console.log('Cloudflare response status:', cloudflareResponse.status);

    if (!cloudflareResponse.ok) {
      const errorText = await cloudflareResponse.text();
      console.error("Cloudflare upload error (Raw):", errorText);
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

    const cloudflareText = await cloudflareResponse.text();
    console.log('Cloudflare raw response:', cloudflareText);

    let cloudflareData: CloudflareImageResponse;
    try {
      cloudflareData = JSON.parse(cloudflareText);
    } catch (e) {
      console.error('Failed to parse Cloudflare success response:', cloudflareText);
      return res.status(500).json({
        error: "Cloudflare returned invalid JSON",
        raw: cloudflareText.slice(0, 500)
      });
    }

    if (!cloudflareData.success) {
      return res.status(500).json({
        error: "Cloudflare upload failed (success=false)",
        details: cloudflareData.errors
      });
    }

    // เก็บข้อมูลลงฐานข้อมูล
    const imageRecord = await prisma.cloudflareImage.create({
      data: {
        cloudflareId: cloudflareData.result.id,
        filename: file.originalFilename || "unknown",
        publicUrl: cloudflareData.result.variants[0], // URL แรก (default variant)
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

    // ลบไฟล์ temp
    fs.unlinkSync(file.filepath);

    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: imageRecord,
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    // ส่ง Error รายละเอียดกลับไปให้ Frontend เห็น (สำหรับ Debug)
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Unknown error",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      rawBody: req.body ? "Body present" : "No body"
    });
  }
}
