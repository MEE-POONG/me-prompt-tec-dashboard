// pages/api/workspace/column/[id].ts
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

      return res.status(200).json(column);
    }

    if (req.method === "DELETE") {
      await prisma.boardColumn.delete({
        where: { id },
      });

      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
