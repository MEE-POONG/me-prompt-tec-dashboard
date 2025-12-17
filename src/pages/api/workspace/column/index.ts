// pages/api/workspace/column/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

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
                  assignedAt: true,
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
      const { boardId, title, order, color } = req.body;

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

      return res.status(201).json(column);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
