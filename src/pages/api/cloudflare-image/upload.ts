import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs";

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
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // ตรวจสอบว่ามี Environment Variables หรือไม่
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return res.status(500).json({
        error: "Cloudflare credentials not configured",
        message: "Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env"
      });
    }

    // Parse form data with formidable
    const form = formidable({ multiples: false });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      }
    );

    // ดึงข้อมูลไฟล์
    const fileArray = files.file;
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    // Metadata จาก form
    const relatedType = fields.relatedType ? String(fields.relatedType[0]) : null;
    const relatedId = fields.relatedId ? String(fields.relatedId[0]) : null;
    const fieldName = fields.fieldName ? String(fields.fieldName[0]) : null;
    const tags = fields.tags ? JSON.parse(String(fields.tags[0])) : [];

    // อ่านไฟล์เป็น Buffer
    const fileBuffer = fs.readFileSync(file.filepath);

    // สร้าง FormData สำหรับส่งไปยัง Cloudflare
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: file.mimetype || "image/jpeg" });
    formData.append("file", blob, file.originalFilename || "image.jpg");

    // อัพโหลดไปยัง Cloudflare Images
    const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;

    const cloudflareResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: formData,
    });

    if (!cloudflareResponse.ok) {
      const errorData = await cloudflareResponse.json();
      console.error("Cloudflare upload error:", errorData);
      return res.status(cloudflareResponse.status).json({
        error: "Failed to upload to Cloudflare",
        details: errorData
      });
    }

    const cloudflareData: CloudflareImageResponse = await cloudflareResponse.json();

    if (!cloudflareData.success) {
      return res.status(500).json({
        error: "Cloudflare upload failed",
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

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
