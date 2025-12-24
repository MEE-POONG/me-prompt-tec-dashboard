import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtime";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const { boardId } = req.query as { boardId?: string };

      if (!boardId) {
        return res.status(400).json({ message: "boardId is required" });
      }

      const columns = await prisma.boardColumn.findMany({
        where: { boardId },
        include: {
          tasks: {
            include: {
              assignees: {
                select: {
                  id: true,
                  userId: true,
                  // assignedAt: true, // เอาออกถ้าไม่มีใน Schema
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatar: true,
                      position: true,
                    },
                  },
                },
              },
              taskMembers: true,
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      });

      return res.status(200).json(columns);
    }

    if (req.method === "POST") {
      const { boardId, title, order, color, user } = req.body; // รับ user เพิ่ม

      if (!boardId || !title) {
        return res
          .status(400)
          .json({ message: "boardId and title are required" });
      }

      const column = await prisma.boardColumn.create({
        data: {
          boardId,
          title,
          order: order ?? 0,
          color,
        },
        include: {
          tasks: true,
        },
      });

      // ✅ Publish Notification (แจ้งเตือนสร้าง List)
      try { 
        publish(String(boardId), { 
            type: "column:created", 
            payload: column,
            // ข้อมูลสำหรับ Notification
            user: user || "System",
            action: "created list",
            target: column.title
        }); 
      } catch (e) { 
        console.error("publish failed", e); 
      }

      return res.status(201).json(column);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}