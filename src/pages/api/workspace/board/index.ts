// pages/api/workspace/board/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const boards = await prisma.projectBoard.findMany({
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
            orderBy: { order: "asc" },
          },
          members: true,
          activities: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(boards);
    }

    if (req.method === "POST") {
      const { name, description, color } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      const board = await prisma.projectBoard.create({
        data: {
          name,
          description,
          color: color || "#3B82F6",
        },
        include: {
          columns: true,
          members: true,
          activities: true,
        },
      });

      return res.status(201).json(board);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
