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
      const task = await prisma.boardTask.findUnique({
        where: { id },
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
            include: {
              board: true,
            },
          },
        },
      });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      return res.status(200).json(task);
    }

    if (req.method === "PUT") {
      const {
        title,
        description,
        tag,
        tagColor,
        priority,
        order,
        dueDate,
        startDate,
        endDate,
        columnId,
        comments,
        attachments,
        checklist,
        assigneeIds,
        user, // ✅ รับชื่อคนแก้ไข
      } = req.body;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (tag !== undefined) updateData.tag = tag;
      if (tagColor !== undefined) updateData.tagColor = tagColor;
      if (priority !== undefined) updateData.priority = priority;
      if (order !== undefined) updateData.order = order;
      if (dueDate !== undefined)
        updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      if (columnId !== undefined) updateData.columnId = columnId;
      if (comments !== undefined) updateData.comments = comments;
      if (attachments !== undefined) updateData.attachments = attachments;
      if (checklist !== undefined) updateData.checklist = checklist;

      // Logic for completedAt based on column move
      if (columnId !== undefined) {
        try {
          const existing = await prisma.boardTask.findUnique({ where: { id }, select: { columnId: true } });
          if (!existing || existing.columnId !== columnId) {
            const col = await prisma.boardColumn.findUnique({ where: { id: String(columnId) }, select: { title: true } });
            const t = (col?.title || "").toLowerCase();
            if (t.includes("done") || t.includes("completed")) {
              updateData.completedAt = new Date();
            } else {
              updateData.completedAt = null;
            }
          }
        } catch (e) {
          // ignore failures
        }
      }

      // Handle assignees
      if (assigneeIds !== undefined) {
        updateData.assignees = {
          deleteMany: {},
          create: assigneeIds.map((uid: string) => ({ userId: uid })),
        };
      }

      const task = await prisma.boardTask.update({
        where: { id },
        data: updateData,
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
          column: true,
        },
      });

      // ✅ Publish Notification พร้อมชื่อ User
      try {
        const boardId = task.column?.boardId || (await prisma.boardColumn.findUnique({ where: { id: task.columnId }, select: { boardId: true } }))?.boardId;

        if (boardId) {
          let actionText = "updated task";
          if (columnId !== undefined) actionText = "moved task";
          if (title !== undefined) actionText = "renamed task";

          publish(String(boardId), {
            type: "task:updated",
            payload: task,
            user: user || "System", // ✅ ใช้ชื่อคนแก้ไข
            action: actionText,
            target: task.title
          });
        }
      } catch (e) {
        console.error("publish failed", e);
      }

      return res.status(200).json(task);
    }

    if (req.method === "DELETE") {
      // fetch task first to get name and boardId
      const existing = await prisma.boardTask.findUnique({
        where: { id },
        select: { id: true, title: true, columnId: true }
      });

      await prisma.boardTask.delete({ where: { id } });

      // ✅ Publish Notification
      try {
        if (existing) {
          const boardId = (await prisma.boardColumn.findUnique({ where: { id: existing.columnId }, select: { boardId: true } }))?.boardId;

          if (boardId) {
            publish(String(boardId), {
              type: "task:deleted",
              payload: { id },
              user: "System",
              action: "deleted task",
              target: existing.title
            });
          }
        }
      } catch (e) { console.error("publish failed", e); }

      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}