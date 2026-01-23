// pages/api/workspace/task/index.ts
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
  try {
    // --- AUTHENTICATION & BOARD ACCESS CHECK ---
    const token = getAuthToken(req.headers.cookie || "");
    const decoded = token ? verifyToken(token) : null;
    const requesterId = decoded?.userId;

    if (!requesterId) {
      if (req.method !== "GET") {
        return res.status(401).json({ message: "Unauthorized: Please login" });
      }
    }

    const getBoardRole = async (boardId: string) => {
      if (!requesterId) return null;
      const user = await (prisma.user.findUnique as any)({ where: { id: requesterId } });
      if (!user) return null;

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
      const { columnId, boardId } = req.query as { columnId?: string; boardId?: string; };
      const where: any = {};
      if (columnId) where.columnId = columnId;
      if (boardId) where.column = { boardId };
      where.isArchived = req.query.archived === "true";

      const tasks = await (prisma.boardTask.findMany as any)({
        where,
        include: {
          assignees: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true, position: true },
              },
            },
          },
          taskMembers: true,
          column: { select: { id: true, title: true, boardId: true } },
        },
        orderBy: { order: "asc" },
      });

      return res.status(200).json(tasks);
    }

    if (req.method === "POST") {
      const {
        columnId, title, description, tag, tagColor, priority,
        order, dueDate, startDate, endDate, checklist, assigneeIds, user
      } = req.body;

      if (!columnId || !title) {
        return res.status(400).json({ message: "columnId and title are required" });
      }

      const column = await (prisma.boardColumn.findUnique as any)({
        where: { id: columnId },
        select: { boardId: true, title: true }
      });

      if (!column) return res.status(404).json({ message: "Column not found" });

      const role = await getBoardRole(column.boardId);
      if (!role && requesterId) { // If requesterId exists but no role found
        return res.status(403).json({ message: "Forbidden: You are not a member of this board" });
      }
      if (role === "Viewer") {
        return res.status(403).json({ message: "Forbidden: Viewer cannot create tasks" });
      }

      let completedAt = null;
      const t = (column.title || "").toLowerCase();
      if (t.includes("done") || t.includes("completed")) completedAt = new Date();

      const task = await (prisma.boardTask.create as any)({
        data: {
          columnId,
          title,
          description: description || "",
          tag: tag || "",
          tagColor: tagColor || "",
          priority: priority || "Medium",
          order: order ?? 0,
          dueDate: dueDate ? new Date(dueDate) : null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          checklist: checklist ?? 0,
          attachments: 0,
          comments: 0,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt,
          assignees: assigneeIds?.length > 0 ? {
            create: assigneeIds.map((uid: string) => ({
              userId: uid,
              createdAt: new Date(),
              updatedAt: new Date()
            })),
          } : undefined,
        },
        include: {
          assignees: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true, position: true },
              },
            },
          },
          taskMembers: true,
        },
      });

      if (column.boardId) {
        publish(String(column.boardId), {
          type: "task:created",
          payload: task,
          user: user || "System",
          action: "created task",
          target: task.title
        });
      }

      return res.status(201).json(task);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error: any) {
    console.error("Task API error:", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}