import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const { boardId } = req.query as { boardId: string };
      if (!boardId) return res.status(400).json({ message: "boardId required" });

      const notifs = await prisma.notification.findMany({
        where: { boardId },
        orderBy: { createdAt: "desc" },
        take: 20, // ดึงล่าสุด 20 รายการ
      });

      return res.status(200).json(notifs);
    }

    // API สำหรับล้างการแจ้งเตือนทั้งหมดในบอร์ดนี้
    if (req.method === "DELETE") {
        const { boardId } = req.query as { boardId: string };
        if (!boardId) return res.status(400).json({ message: "boardId required" });

        await prisma.notification.deleteMany({
            where: { boardId }
        });
        
        return res.status(200).json({ message: "Cleared" });
    }

    return res.status(405).end();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}