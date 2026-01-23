import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      page = "1",
      limit = "20",
      search = "",
      status = "",
      date = "",
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;

    const where: any = {};

    // Search name or email
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
        // แถมค้นหาจากหัวข้อ (Subject) ให้ด้วยครับ
        { subject: { contains: search as string, mode: "insensitive" } },
      ];
    }

    // --- ✅ แก้ไขตรงนี้ครับ (Logic กรองดาว) ---
    if (status) {
      if (status === "starred") {
        // ถ้าเลือกตัวกรอง "สำคัญ" ให้หา field isStarred = true
        where.isStarred = true;
      } else {
        // ถ้าเลือกตัวกรองอื่น (new, in-progress) ให้หาตาม status ปกติ
        where.status = status;
      }
    }
    // ----------------------------------------

    // Filter by date (yyyy-mm-dd)
    if (date) {
      const start = new Date(date as string);
      const end = new Date(date as string);
      end.setDate(end.getDate() + 1);

      where.createdAt = {
        gte: start,
        lt: end,
      };
    }

    const total = await prisma.contactMessage.count({ where });
    const totalPages = Math.ceil(total / limitNum);

    const data = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    return res.status(200).json({
      data,
      meta: {
        total,
        page: pageNum,
        totalPages,
      },
    });
  } catch (err) {
    console.error("GET contacts error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}