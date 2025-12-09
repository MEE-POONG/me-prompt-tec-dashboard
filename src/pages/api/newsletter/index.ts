import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 20);
      const search = (req.query.search as string | undefined)?.trim();
      
      // ✅ รับค่าการเรียงลำดับ (ถ้าไม่ส่งมา ให้ Default เป็น 'asc' คือเก่าสุดขึ้นก่อน ตามที่คุณต้องการ)
      const sort = (req.query.sort as string) === "desc" ? "desc" : "asc";

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
          // ✅ ใช้ตัวแปร sort ที่รับมา
          orderBy: { createdAt: sort },
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