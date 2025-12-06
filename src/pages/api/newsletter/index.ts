// src/pages/api/newsletter/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // GET /api/newsletter?page=1&pageSize=20&search=xxx
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 20);
      const search = (req.query.search as string | undefined)?.trim();

      const where = search
        ? {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          }
        : {};

      const [total, items] = await Promise.all([
        prisma.newsletterSubscriber.count({ where }),
        prisma.newsletterSubscriber.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);

      return res.status(200).json({
        success: true,
        data: items,
        total,
        page,
        pageSize,
      });
    } catch (error) {
      console.error("GET /api/newsletter error:", error);
      return res
        .status(500)
        .json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
  }

  if (req.method === "DELETE") {
    // DELETE /api/newsletter?id=xxxx
    try {
      const id = req.query.id as string | undefined;

      if (!id) {
        return res
          .status(400)
          .json({ success: false, message: "ต้องระบุ id ที่ต้องการลบ" });
      }

      await prisma.newsletterSubscriber.delete({ where: { id } });

      return res.status(200).json({
        success: true,
        message: "ลบสมาชิกเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("DELETE /api/newsletter error:", error);
      return res
        .status(500)
        .json({ success: false, message: "ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" });
    }
  }

  res.setHeader("Allow", ["GET", "DELETE"]);
  return res.status(405).json({ success: false, message: "Method not allowed" });
}
