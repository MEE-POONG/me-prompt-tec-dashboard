// pages/api/workspace/task/[id].ts
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
              // assignedAt: true, <--- ลบออกแล้ว
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
        columnId,
        comments,
        attachments,
        checklist,
        assigneeIds,
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
      if (columnId !== undefined) updateData.columnId = columnId;
      if (comments !== undefined) updateData.comments = comments;
      if (attachments !== undefined) updateData.attachments = attachments;
      if (checklist !== undefined) updateData.checklist = checklist;

      // Handle assignees separately
      if (assigneeIds !== undefined) {
        // First, disconnect all current assignees
        await prisma.boardTask.update({
          where: { id },
          data: {
            assignees: {
              set: [], // Clear all assignees
            },
          },
        });

        // Then connect new assignees
        if (assigneeIds.length > 0) {
          updateData.assignees = {
            connect: assigneeIds.map((userId: string) => ({ id: userId })),
          };
        }
      }

      const task = await prisma.boardTask.update({
        where: { id },
        data: updateData,
        include: {
          assignees: {
            select: {
              id: true,
              userId: true,
              // assignedAt: true, <--- ลบออกแล้ว
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

      // publish update to board channel
      try {
        const boardId = task.column?.boardId || (await prisma.boardColumn.findUnique({ where: { id: task.columnId }, select: { boardId: true } }))?.boardId;
        if (boardId) publish(String(boardId), { type: "task:updated", payload: task });
      } catch (e) {
        console.error("publish failed", e);
      }

      return res.status(200).json(task);
    }

    if (req.method === "DELETE") {
      // fetch task to get boardId/column
      const existing = await prisma.boardTask.findUnique({ where: { id }, select: { id: true, columnId: true } });
      await prisma.boardTask.delete({ where: { id } });
      try {
        const boardId = existing ? (await prisma.boardColumn.findUnique({ where: { id: existing.columnId }, select: { boardId: true } }))?.boardId : null;
        if (boardId) publish(String(boardId), { type: "task:deleted", payload: { id } });
      } catch (e) { console.error("publish failed", e); }

      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}