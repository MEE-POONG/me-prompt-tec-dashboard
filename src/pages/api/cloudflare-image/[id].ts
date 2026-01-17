import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", ["GET", "DELETE", "OPTIONS"]);
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case "GET":
        return await handleGet(req, res);
      case "DELETE":
        return await handleDelete(req, res);
      default:
        res.setHeader("Allow", ["GET", "DELETE", "OPTIONS"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

// GET /api/cloudflare-image/[id] - ดึงข้อมูลรูปภาพตาม ID
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid image ID" });
  }

  const image = await prisma.cloudflareImage.findUnique({
    where: { id },
  });

  if (!image) {
    return res.status(404).json({ error: "Image not found" });
  }

  return res.status(200).json({
    data: image,
  });
}

// DELETE /api/cloudflare-image/[id] - ลบรูปภาพ (ทั้งจาก Cloudflare และ Database)
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid image ID" });
  }

  // ดึงข้อมูลรูปภาพจาก Database
  const image = await prisma.cloudflareImage.findUnique({
    where: { id },
  });

  if (!image) {
    return res.status(404).json({ error: "Image not found" });
  }

  // ตรวจสอบว่ามี Cloudflare credentials หรือไม่
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && apiToken) {
    // ลบรูปภาพจาก Cloudflare
    try {
      const deleteUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${image.cloudflareId}`;

      const cloudflareResponse = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      });

      if (!cloudflareResponse.ok) {
        const errorData = await cloudflareResponse.json();
        console.error("Cloudflare delete error:", errorData);
        // ไม่ return error เพราะอาจจะรูปถูกลบไปแล้วหรือไม่มีอยู่
      }
    } catch (error) {
      console.error("Error deleting from Cloudflare:", error);
      // ไม่ throw error เพราะเราอย่างน้อยต้องลบจาก database
    }
  }

  // ลบข้อมูลจาก Database
  await prisma.cloudflareImage.delete({
    where: { id },
  });

  return res.status(200).json({
    success: true,
    message: "Image deleted successfully",
  });
}
