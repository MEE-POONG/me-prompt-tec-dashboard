import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtime";

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
      
      // ✅ Default: Hide archived tasks
      if (req.query.archived === "true") {
        where.isArchived = true;
      } else {
        where.isArchived = false;
      }

      const tasks = await prisma.boardTask.findMany({
        where,
        include: {
          assignees: {
            select: {
              id: true,
              userId: true,
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
        startDate,
        endDate,
        checklist,
        assigneeIds,
        user, // ✅ รับชื่อ user จาก Frontend
      } = req.body;

      if (!columnId || !title) {
        return res
          .status(400)
          .json({ message: "columnId and title are required" });
      }

      // determine if initial column should mark as completed
      let completedAt: Date | undefined = undefined;
      try {
        const col = await prisma.boardColumn.findUnique({ where: { id: columnId }, select: { title: true } });
        const t = (col?.title || "").toLowerCase();
        if (t.includes("done") || t.includes("completed")) completedAt = new Date();
      } catch (e) { /* ignore */ }

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
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          checklist: checklist ?? 0,
          completedAt,
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

      // ✅ Publish Notification พร้อมชื่อ User
      try {
        const col = await prisma.boardColumn.findUnique({ where: { id: columnId }, select: { boardId: true } });
        
        if (col?.boardId) {
            publish(String(col.boardId), { 
                type: "task:created", 
                payload: task,
                user: user || "System", // ✅ ใช้ user ที่ส่งมา ถ้าไม่มีใช้ System
                action: "created task", 
                target: task.title
            });
        }
      } catch (e) {
        console.error("publish failed", e);
      }

      return res.status(201).json(task);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}