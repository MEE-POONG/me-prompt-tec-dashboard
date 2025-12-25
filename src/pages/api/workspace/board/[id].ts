// pages/api/workspace/board/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

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
      const board = await prisma.projectBoard.findUnique({
        where: { id },
        include: {
          columns: {
            include: {
              tasks: {
                where: { isArchived: false }, // ✅ Filter out archived tasks
                include: {
                  assignees: {
                    select: {
                      id: true,
                      userId: true,
                      // assignedAt: true, <--- ลบบรรทัดที่เคย error ออกแล้ว
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
          },
          members: true,
          // boardLabels: true,
          activities: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });

      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }

      return res.status(200).json(board);
    }

    if (req.method === "PUT") {
      const { name, description, color, visibility } = req.body;

      const board = await prisma.projectBoard.update({
        where: { id },
        data: { name, description, color, visibility },
        include: {
          columns: {
            include: {
              tasks: {
                include: {
                  assignees: true,
                  taskMembers: true,
                },
              },
            },
          },
          members: true,
          activities: true,
        },
      });

      return res.status(200).json(board);
    }

    if (req.method === "DELETE") {
      await prisma.projectBoard.delete({
        where: { id },
      });

      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    if ((error as any).code === "P2002") {
      return res.status(409).json({ message: "Workspace name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
}