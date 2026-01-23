// pages/api/workspace/board/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

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
      const boards = await (prisma.projectBoard.findMany as any)({
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

      // Patch members email if null and requested as non-nullable
      const patchedBoards = boards.map((board: any) => ({
        ...board,
        members: board.members?.map((m: any) => ({
          ...m,
          email: m.email || "" // Ensure it's never null
        }))
      }));

      return res.status(200).json(patchedBoards);
    }

    if (req.method === "POST") {
      const { name, description, color, visibility, creator } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      // Create board with default columns (To Do / In Progress / Done)
      // Manually added createdAt and updatedAt to satisfy old client requirements
      const board = await (prisma.projectBoard.create as any)({
        data: {
          name,
          description: description || "",
          color: color || "#3B82F6",
          visibility: visibility || "PRIVATE",
          createdAt: new Date(),
          updatedAt: new Date(),
          columns: {
            create: [
              { title: "To Do", order: 0, color: "bg-slate-50", createdAt: new Date() },
              { title: "In Progress", order: 1, color: "bg-blue-50", createdAt: new Date() },
              { title: "Done", order: 2, color: "bg-green-50", createdAt: new Date() },
            ],
          },
          members: {
            create: creator?.name ? [{
              name: creator.name,
              email: creator.email || "",
              role: "Owner",
              avatar: creator.avatar || "",
              color: "#3B82F6",
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
  } catch (error: any) {
    console.error("Board API Error:", error);
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Workspace name already exists" });
    }
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}
