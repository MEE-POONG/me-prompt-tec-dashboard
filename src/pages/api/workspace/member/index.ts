// pages/api/workspace/member/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const { boardId } = req.query as { boardId?: string };

      if (!boardId) {
        return res.status(400).json({ message: "boardId is required" });
      }

      const members = await prisma.boardMember.findMany({
        where: { boardId },
        orderBy: { name: "asc" },
      });

      // Fetch users to map userId
      const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });

      const membersWithUserId = members.map((m) => {
        // Attempt to find user by email (stored in name) or name
        const user = users.find(u => u.email === m.name || u.name === m.name);
        return { ...m, userId: user?.id };
      });

      return res.status(200).json(membersWithUserId);
    }

    if (req.method === "POST") {
      const { boardId, name, role, avatar, color, email } = req.body;

      if (!boardId) {
        return res.status(400).json({ message: "boardId is required" });
      }

      // Logic 1: Invite by Email (Priority)
      if (email) {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return res.status(404).json({ message: "อีเมลนี้ไม่มีอยู่ในระบบ" });
        }

        if (!user.isVerified) {
          return res.status(400).json({ message: "อีเมลนี้ยังไม่ได้ยืนยันตัวตนในระบบ" });
        }

        // Check if already a member
        const existingMember = await prisma.boardMember.findFirst({
          where: {
            boardId,
            name: user.name || user.email, // Simple check by name/email mapping for now
          },
        });

        if (existingMember) {
          return res.status(409).json({ message: "User is already a member of this board" });
        }

        const newMember = await prisma.boardMember.create({
          data: {
            boardId,
            name: user.name || user.email, // Use Name or Email as display name
            role: role || "Viewer",
            avatar: user.avatar || undefined, // Use user avatar if available
            color: color || "bg-blue-500", // Default color
          },
        });

        return res.status(201).json(newMember);
      }

      // Logic 2: Direct Add (Legacy/Mockup support)
      if (!name || !role) {
        return res
          .status(400)
          .json({ message: "If not inviting by email, name and role are required" });
      }

      const member = await prisma.boardMember.create({
        data: {
          boardId,
          name,
          role,
          avatar,
          color,
        },
      });

      return res.status(201).json(member);
    }

    if (req.method === "PUT") {
      const { id, role } = req.body;

      if (!id || !role) {
        return res.status(400).json({ message: "Member ID and Role are required" });
      }

      try {
        const updatedMember = await prisma.boardMember.update({
          where: { id },
          data: { role },
        });
        return res.status(200).json(updatedMember);
      } catch (error) {
        return res.status(500).json({ message: "Failed to update member role" });
      }
    }

    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Member ID is required" });
      }

      await prisma.boardMember.delete({
        where: { id },
      });

      return res.status(200).json({ message: "Member removed successfully" });
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
