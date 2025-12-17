// pages/api/workspace/task/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const { columnId, boardId } = req.query as {
        columnId?: string;
        boardId?: string;
      };

      const where: any = {};
      if (columnId) where.columnId = columnId;
      if (boardId) where.column = { boardId };

      const tasks = await prisma.boardTask.findMany({
        where,
        include: {
          assignees: {
            select: {
              id: true,
              userId: true,
              // assignedAt: true,  <-- ลบออก
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
          column: {
            select: {
              id: true,
              title: true,
              boardId: true,
            },
          },
        },
        orderBy: { order: "asc" },
      });

      return res.status(200).json(tasks);
    }

    if (req.method === "POST") {
      const {
        columnId,
        title,
        description,
        tag,
        tagColor,
        priority,
        order,
        dueDate,
        assigneeIds,
      } = req.body;

      if (!columnId || !title) {
        return res
          .status(400)
          .json({ message: "columnId and title are required" });
      }

      const task = await prisma.boardTask.create({
        data: {
          columnId,
          title,
          description,
          tag,
          tagColor,
          priority: priority || "Medium",
          order: order ?? 0,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          ...(assigneeIds &&
            assigneeIds.length > 0 && {
              assignees: {
                connect: assigneeIds.map((id: string) => ({ id })),
              },
            }),
        },
        include: {
          assignees: {
            select: {
              id: true,
              userId: true,
              // assignedAt: true, <-- ลบออก
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
      });

      return res.status(201).json(task);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}