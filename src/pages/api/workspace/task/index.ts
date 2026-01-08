// pages/api/workspace/task/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtime";
import { getAuthToken } from "@/lib/auth/cookies";
import { verifyToken } from "@/lib/auth/jwt";

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
      if (req.method !== "GET") { // Allow public read if board is public (handled locally or via other logic), but strictly block writes
        return res.status(401).json({ message: "Unauthorized: Please login" });
      }
    }

    // Helper: Check if user is member of board
    const checkBoardAccess = async (boardId: string) => {
      if (!requesterId) return false;

      const user = await prisma.user.findUnique({ where: { id: requesterId } });
      if (!user) return false;

      // 1. Try strict match
      const member = await prisma.boardMember.findFirst({
        where: {
          boardId,
          OR: [
            { name: user.name || "" },
            { name: user.email }
          ]
        }
      });
      if (member) return true;

      // 2. Fallback: Loose match
      const allMembers = await prisma.boardMember.findMany({
        where: { boardId },
        select: { name: true }
      });

      const userEmail = (user.email || "").toLowerCase().trim();
      const userName = (user.name || "").toLowerCase().trim();

      const matched = allMembers.find(m => {
        const memberName = (m.name || "").toLowerCase().trim();
        return memberName === userEmail || memberName === userName;
      });

      return !!matched;
    };

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

      // --- SECURITY CHECK ---
      // 1. Get Board ID from Column
      const column = await prisma.boardColumn.findUnique({
        where: { id: columnId },
        select: { boardId: true, title: true }
      });

      if (!column) {
        return res.status(404).json({ message: "Column not found" });
      }

      // 2. Check if requester is a member of this board
      const isMember = await checkBoardAccess(column.boardId);
      if (!isMember) {
        return res.status(403).json({ message: "Forbidden: You are not a member of this board" });
      }

      // determine if initial column should mark as completed
      let completedAt: Date | undefined = undefined;
      try {
        const t = (column.title || "").toLowerCase();
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
              create: assigneeIds.map((uid: string) => ({ userId: uid })),
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
        if (column.boardId) {
          publish(String(column.boardId), {
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