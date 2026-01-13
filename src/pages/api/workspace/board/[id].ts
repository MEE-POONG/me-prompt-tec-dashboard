// pages/api/workspace/board/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getAuthToken } from "@/lib/auth/cookies";
import { verifyToken } from "@/lib/auth/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query as { id: string };

  if (!id) {
    return res.status(400).json({ message: "Missing id" });
  }

  try {
    // --- AUTHENTICATION CHECK ---
    const token = getAuthToken(req.headers.cookie || "");
    const decoded = token ? verifyToken(token) : null;
    const requesterId = decoded?.userId;

    if (!requesterId) {
      if (req.method !== "GET") {
        return res.status(401).json({ message: "Unauthorized: Please login" });
      }
    }

    // Helper: Check requester's role
    const getRequesterRole = async () => {
      if (!requesterId) return null;
      const user = await prisma.user.findUnique({ where: { id: requesterId } });
      if (!user) return null;

      // Try strict match first
      const member = await prisma.boardMember.findFirst({
        where: {
          boardId: id,
          OR: [{ name: user.name || "" }, { name: user.email }],
        },
      });

      if (member) return member.role;

      // Fallback: Loose match
      const allMembers = await prisma.boardMember.findMany({
        where: { boardId: id },
      });
      const userEmail = (user.email || "").toLowerCase().trim();
      const userName = (user.name || "").toLowerCase().trim();
      const matched = allMembers.find((m) => {
        const mName = m.name.toLowerCase().trim();
        return mName === userEmail || mName === userName;
      });
      return matched?.role || null;
    };

    if (req.method === "GET") {
      const board = await prisma.projectBoard.findUnique({
        where: { id },
        include: {
          columns: {
            include: {
              tasks: {
                where: { isArchived: false },
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
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
          members: true,
          activities: {
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
              // Optionally include user info if needed for activities
            },
          },
        },
      });

      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }

      return res.status(200).json(board);
    }

    if (req.method === "PUT") {
      const role = await getRequesterRole();
      if (role !== "Admin" && role !== "Owner") {
        return res.status(403).json({ message: "Forbidden: Only Admin/Owner can update board settings" });
      }

      const { name, description, color, visibility } = req.body;

      const board = await prisma.projectBoard.update({
        where: { id },
        data: { name, description, color, visibility },
        include: {
          columns: {
            include: {
              tasks: {
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
                        },
                      },
                    },
                  },
                  taskMembers: true,
                },
              },
            },
          },
          members: true,
          activities: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });

      // Map avatars
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, avatar: true },
      });

      const membersWithAvatars = board.members.map((m) => {
        const user = users.find(
          (u) =>
            (u.email && u.email.toLowerCase() === m.name.toLowerCase()) ||
            (u.name && u.name.trim() === m.name.trim())
        );
        return {
          ...m,
          avatar: user?.avatar || m.avatar,
          userId: user?.id,
        };
      });

      return res.status(200).json({
        ...board,
        members: membersWithAvatars,
      });
    }

    if (req.method === "DELETE") {
      const role = await getRequesterRole();
      if (role !== "Admin" && role !== "Owner") {
        return res.status(403).json({ message: "Forbidden: Only Admin/Owner can delete board" });
      }

      await prisma.projectBoard.delete({
        where: { id },
      });

      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    if ((error as any).code === "P2002") {
      return res.status(409).json({ message: "Workspace name already exists" });
    }
    return res
      .status(500)
      .json({ message: `Server error: ${(error as any).message}` });
  }
}
