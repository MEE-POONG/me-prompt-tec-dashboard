// pages/api/workspace/column/[id].ts
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
      const { title, order, color } = req.body;

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

      try { publish(String(column.boardId), { type: "column:updated", payload: column }); } catch (e) { console.error(e); }
      return res.status(200).json(column);
    }

    if (req.method === "DELETE") {
      // fetch boardId then delete
      const existing = await prisma.boardColumn.findUnique({ where: { id }, select: { boardId: true } });
      await prisma.boardColumn.delete({ where: { id } });
      try { if (existing?.boardId) publish(String(existing.boardId), { type: "column:deleted", payload: { id } }); } catch (e) { console.error(e); }
      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
