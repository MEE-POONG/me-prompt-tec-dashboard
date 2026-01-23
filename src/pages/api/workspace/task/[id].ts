// pages/api/workspace/task/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtime";
import { getAuthToken } from "@/lib/auth/cookies";
import { verifyToken } from "@/lib/auth/jwt";

// Helper to handle BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query as { id: string };

  if (!id) {
    return res.status(400).json({ message: "Missing id" });
  }

  try {
    // --- AUTHENTICATION & BOARD ACCESS CHECK ---
    const token = getAuthToken(req.headers.cookie || "");
    const decoded = token ? verifyToken(token) : null;
    const requesterId = decoded?.userId;

    if (!requesterId) {
      if (req.method !== "GET") { // Allow public read if allowed, but strict for write
        return res.status(401).json({ message: "Unauthorized: Please login" });
      }
    }

    // Helper: Check if user is member of board and return Role
    const getBoardRole = async (boardId: string) => {
      if (!requesterId) return null;
      const user = await (prisma.user.findUnique as any)({ where: { id: requesterId } });
      if (!user) return null;

      // 1. Try strict match first
      const member = await (prisma.boardMember.findFirst as any)({
        where: {
          boardId,
          OR: [
            { name: user.name || "" },
            { name: (user.email || "") }
          ]
        }
      });
      if (member) return member.role;

      // 2. Fallback: Loose match
      const allMembers = await (prisma.boardMember.findMany as any)({
        where: { boardId },
      });
      const userEmail = (user.email || "").toLowerCase().trim();
      const userName = (user.name || "").toLowerCase().trim();
      const matched = allMembers.find((m: any) => {
        const memberName = (m.name || "").toLowerCase().trim();
        return memberName === userEmail || memberName === userName;
      });
      return matched?.role || null;
    };

    if (req.method === "GET") {
      const task = await (prisma.boardTask.findUnique as any)({
        where: { id },
        include: {
          assignees: {
            select: { id: true, userId: true },
          },
          taskMembers: true,
          column: {
            include: { board: true },
          },
        },
      });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      return res.status(200).json(task);
    }

    if (req.method === "PUT") {
      // 1. Fetch Task
      const existingTask = await (prisma.boardTask.findUnique as any)({
        where: { id },
        include: { column: true }
      });
      if (!existingTask) return res.status(404).json({ message: "Task not found" });

      // 2. Check Permissions
      const boardId = existingTask.column.boardId;
      const role = await getBoardRole(boardId);
      if (!role && requesterId) {
        return res.status(403).json({ message: "Forbidden: You are not a member of this board" });
      }
      if (role === "Viewer") {
        return res.status(403).json({ message: "Forbidden: Viewer cannot update tasks" });
      }

      const {
        title, description, tag, tagColor, priority, order,
        dueDate, startDate, endDate, columnId, comments,
        attachments, checklist, assigneeIds, user
      } = req.body;

      const updateData: any = { updatedAt: new Date() }; // Always update updatedAt
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (tag !== undefined) updateData.tag = tag;
      if (tagColor !== undefined) updateData.tagColor = tagColor;
      if (priority !== undefined) updateData.priority = priority;
      if (order !== undefined) updateData.order = order;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      if (columnId !== undefined) updateData.columnId = columnId;
      if (comments !== undefined) updateData.comments = comments;
      if (attachments !== undefined) updateData.attachments = attachments;
      if (checklist !== undefined) updateData.checklist = checklist;
      if (req.body.isArchived !== undefined) updateData.isArchived = req.body.isArchived;

      // Logic for completedAt based on column move
      if (columnId !== undefined) {
        try {
          if (existingTask.columnId !== columnId) {
            const col = await (prisma.boardColumn.findUnique as any)({ where: { id: String(columnId) }, select: { title: true } });
            const t = (col?.title || "").toLowerCase();
            if (t.includes("done") || t.includes("completed")) {
              updateData.completedAt = new Date();
            } else {
              updateData.completedAt = null;
            }
          }
        } catch (e) { /* ignore */ }
      }

      // Handle assignees
      if (assigneeIds !== undefined) {
        updateData.assignees = {
          deleteMany: {},
          create: assigneeIds.map((uid: string) => ({ userId: uid })),
        };
      }

      const task = await (prisma.boardTask.update as any)({
        where: { id },
        data: updateData,
        include: {
          assignees: { select: { id: true, userId: true } },
          taskMembers: true,
          column: true,
        },
      });

      try {
        if (boardId) {
          let actionText = "updated task";
          if (columnId !== undefined) actionText = "moved task";
          if (title !== undefined) actionText = "renamed task";

          publish(String(boardId), {
            type: "task:updated",
            payload: task,
            user: user || "System",
            action: actionText,
            target: task.title
          });
        }
      } catch (e) { console.error("publish failed", e); }

      return res.status(200).json(task);
    }

    if (req.method === "DELETE") {
      const existing = await (prisma.boardTask.findUnique as any)({
        where: { id },
        select: { id: true, title: true, columnId: true, isArchived: true, column: { select: { boardId: true } } }
      });
      if (!existing) return res.status(404).json({ message: "Task not found" });

      const role = await getBoardRole(existing.column.boardId);
      if (!role) return res.status(403).json({ message: "Forbidden: You are not a member of this board" });
      if (role === "Viewer") return res.status(403).json({ message: "Forbidden: Viewer cannot delete tasks" });

      const updated = await (prisma.boardTask.update as any)({
        where: { id },
        data: { isArchived: true }
      });

      try {
        const boardId = existing.column.boardId;
        if (boardId) {
          publish(String(boardId), {
            type: "task:updated",
            payload: updated,
            user: "System",
            action: "archived task",
            target: existing.title
          });
        }
      } catch (e) { console.error("publish failed", e); }

      return res.status(200).json(updated);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error: any) {
    console.error("Task [id] API error:", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}