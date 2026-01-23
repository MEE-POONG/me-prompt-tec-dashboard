import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtime";

// Helper to handle BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

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

      const columns = await (prisma.boardColumn.findMany as any)({
        where: { boardId },
        include: {
          tasks: {
            include: {
              assignees: {
                include: {
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
      const { boardId, title, order, color, user } = req.body;

      if (!boardId || !title) {
        return res.status(400).json({ message: "boardId and title are required" });
      }

      const column = await (prisma.boardColumn.create as any)({
        data: {
          boardId,
          title,
          order: order ?? 0,
          color: color || null,
        },
        include: {
          tasks: true,
        },
      });

      try {
        publish(String(boardId), {
          type: "column:created",
          payload: column,
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
  } catch (error: any) {
    console.error("Column API error:", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}