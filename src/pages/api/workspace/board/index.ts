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
      const { name, description, color, visibility } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      // Create board with default columns (To Do / In Progress / Done)
      const board = await prisma.projectBoard.create({
        data: {
          name,
          description,
          color: color || "#3B82F6",
          visibility: visibility || "PRIVATE",
          columns: {
            create: [
              { title: "To Do", order: 0, color: "bg-slate-50" },
              { title: "In Progress", order: 1, color: "bg-blue-50" },
              { title: "Done", order: 2, color: "bg-green-50" },
            ],
          },
          members: {
            create: req.body.creator?.name ? [{
              name: req.body.creator.name,
              role: "Owner",
              avatar: req.body.creator.avatar || "",
              color: "#3B82F6",
              // email: req.body.creator.email // Reverted until schema update works
            }] : [],
          }
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
    if ((error as any).code === "P2002") {
      return res.status(409).json({ message: "Workspace name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
}
