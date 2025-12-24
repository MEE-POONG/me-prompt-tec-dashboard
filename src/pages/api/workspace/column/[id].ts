import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtime";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query as { id: string };

  if (!id) {
    return res.status(400).json({ message: "Missing id" });
  }

  try {
    if (req.method === "GET") {
      const column = await prisma.boardColumn.findUnique({
        where: { id },
        include: {
          tasks: {
            include: {
              assignees: true,
              taskMembers: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!column) {
        return res.status(404).json({ message: "Column not found" });
      }

      return res.status(200).json(column);
    }

    if (req.method === "PUT") {
      const { title, order, color, user } = req.body; // รับ user เพิ่ม

      const column = await prisma.boardColumn.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(order !== undefined && { order }),
          ...(color !== undefined && { color }),
        },
        include: {
          tasks: true,
        },
      });

      // ✅ Publish Notification (แจ้งเตือนแก้ไข/ย้าย List)
      try { 
        let actionText = "updated list";
        if (title) actionText = "renamed list"; // ถ้าเปลี่ยนชื่อ
        
        // ถ้าแค่ย้ายตำแหน่ง (order) อาจจะไม่ต้องแจ้งเตือน user ทั่วไปก็ได้ หรือจะแจ้งเป็น "reordered list"
        
        if (title) { // แจ้งเตือนเฉพาะเปลี่ยนชื่อ
            publish(String(column.boardId), { 
                type: "column:updated", 
                payload: column,
                user: user || "System",
                action: actionText,
                target: column.title
            }); 
        } else {
            // กรณีแค่อัปเดตอื่นๆ ส่ง payload เพื่อ refresh หน้าจอเฉยๆ
            publish(String(column.boardId), { type: "column:updated", payload: column });
        }

      } catch (e) { 
        console.error("publish failed", e); 
      }
      
      return res.status(200).json(column);
    }

    if (req.method === "DELETE") {
      // fetch boardId then delete
      const existing = await prisma.boardColumn.findUnique({ where: { id }, select: { boardId: true, title: true } });
      
      await prisma.boardColumn.delete({ where: { id } });
      
      // ✅ Publish Notification (แจ้งเตือนลบ List)
      try { 
        if (existing?.boardId) { 
            publish(String(existing.boardId), { 
                type: "column:deleted", 
                payload: { id },
                user: "System",
                action: "deleted list",
                target: existing.title
            }); 
        } 
      } catch (e) { 
        console.error("publish failed", e); 
      }
      
      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}