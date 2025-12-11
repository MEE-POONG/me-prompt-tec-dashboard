import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
// -------------------------------------------------------------------
// API Handler
// -------------------------------------------------------------------
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "POST":
        return await handlePost(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res
          .status(405)
          .json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// -------------------------------------------------------------------
// 📌 POST: ดึงรายการผู้ใช้งานทั้งหมด (ใช้ POST เพื่อส่ง keyword ซ่อนไว้ใน body)
// -------------------------------------------------------------------
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const where: any = {};
    const { keyword } = req.body;
    if (keyword && keyword.trim() !== "") {
      const key = keyword.trim();
      where.OR = [
        { name: { contains: keyword, mode: "insensitive" } },
        { email: { contains: keyword, mode: "insensitive" } },
        { position: { contains: keyword, mode: "insensitive" } },
        { phone: { contains: keyword, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        role: true,
        isVerified: true,
        isActive: true,
      },
    });

    return res.status(200).json(users);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return res.status(401).json({
        error: "UNAUTHORIZED",
        message: "กรุณาเข้าสู่ระบบ (Token Invalid)",
      });
    }
    throw error;
  }
}
