import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", ["GET", "OPTIONS"]);
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case "GET":
        return await handleGet(req, res);
      default:
        res.setHeader("Allow", ["GET", "OPTIONS"]);
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

// GET /api/cloudflare-image - ดึงรายการรูปภาพทั้งหมด
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const {
    page = "1",
    limit = "20",
    relatedType,
    relatedId,
    fieldName,
    tags,
    isActive = "true"
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // สร้าง filter conditions
  const where: any = {};

  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }

  if (relatedType) {
    where.relatedType = relatedType as string;
  }

  if (relatedId) {
    where.relatedId = relatedId as string;
  }

  if (fieldName) {
    where.fieldName = fieldName as string;
  }

  if (tags) {
    const tagArray = (tags as string).split(",");
    where.tags = { hasSome: tagArray };
  }

  // ดึงข้อมูล
  const [images, total] = await Promise.all([
    prisma.cloudflareImage.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.cloudflareImage.count({ where }),
  ]);

  return res.status(200).json({
    data: images,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}
