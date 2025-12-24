import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  // GET: ดึงข้อมูล Board 1 อัน พร้อม Columns และ Tasks
  if (req.method === "GET") {
    try {
      const board = await prisma.projectBoard.findUnique({
        where: { id },
        include: {
          members: true, // สมาชิกในบอร์ด
          boardLabels: true, // Label สีต่างๆ
          columns: {
            include: {
              tasks: {
                include: {
                  assignees: { include: { user: true } }, // ดึงคนรับผิดชอบ
                  taskMembers: true,
                  taskComments: true,
                },
                orderBy: { order: 'asc' } // เรียง Task ตามลำดับ
              },
            },
            orderBy: {
              order: 'asc' // เรียง Column ตามลำดับ
            }
          },
        },
      });

      if (!board) {
        return res.status(404).json({ error: "Board not found" });
      }

      return res.status(200).json(board);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // DELETE: ลบ Board
  if (req.method === "DELETE") {
    try {
      await prisma.projectBoard.delete({
        where: { id },
      });
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete board" });
    }
  }

  res.setHeader("Allow", ["GET", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}