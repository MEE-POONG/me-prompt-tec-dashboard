// pages/api/workspace/member/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getAuthToken } from "@/lib/auth/cookies";
import { verifyToken } from "@/lib/auth/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // --- AUTHENTICATION CHECK (Except for initial GET if public read is allowed, 
    // but here we might want to know who is asking to filter/enhance data) ---
    const token = getAuthToken(req.headers.cookie || "");
    const decoded = token ? verifyToken(token) : null;
    const requesterId = decoded?.userId;

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
      const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, avatar: true } });

      const membersWithUserId = members.map((m) => {
        // Attempt to find user by email (stored in name) or name
        const user = users.find(u => u.email === m.name || u.name === m.name);
        return {
          ...m,
          userId: user?.id,
          avatar: user?.avatar || m.avatar
        };
      });

      return res.status(200).json(membersWithUserId);
    }

    // --- PROTECTED ROUTES (POST, PUT, DELETE) ---
    if (!requesterId) {
      return res.status(401).json({ message: "Unauthorized: Please login" });
    }

    // Helper: Check requester's role on the board
    const getRequesterRole = async (boardId: string) => {
      // 1. Find the User to get their Name/Email (since BoardMember uses name/email mostly)
      const user = await prisma.user.findUnique({ where: { id: requesterId } });
      if (!user) return null;

      // 2. Find BoardMember record
      // Logic relies on matching Name or Email. 
      // Ideally should match by userId if schema supports it, but preserving existing logic:
      const member = await prisma.boardMember.findFirst({
        where: {
          boardId,
          OR: [
            { name: user.name || "" },
            { name: user.email }
          ]
        }
      });
      return member?.role; // "Admin", "Editor", "Viewer", "Owner"
    };

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
          return res
            .status(400)
            .json({ message: "อีเมลนี้ยังไม่ได้ยืนยันตัวตนในระบบ" });
        }

        // Check if already a member
        const existingMember = await prisma.boardMember.findFirst({
          where: {
            boardId,
            name: user.name || user.email, // Simple check by name/email mapping for now
          },
        });

        if (existingMember) {
          return res
            .status(409)
            .json({ message: "User is already a member of this board" });
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

        // ✅ Log Activity
        await prisma.boardActivity.create({
          data: {
            boardId,
            user: "You", // TODO: Should get current user name from session/token if possible
            action: "invited",
            target: user.email,
          }
        });

        return res.status(201).json(newMember);
      }

      // Logic 2: Direct Add (Legacy/Mockup support)
      if (!name || !role) {
        return res
          .status(400)
          .json({
            message: "If not inviting by email, name and role are required",
          });
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

      // ✅ Log Activity
      await prisma.boardActivity.create({
        data: {
          boardId,
          user: "You",
          action: "added member",
          target: name,
        }
      });

      return res.status(201).json(member);
    }

    if (req.method === "PUT") {
      const { id, role } = req.body;

      if (!id || !role) {
        return res
          .status(400)
          .json({ message: "Member ID and Role are required" });
      }

      try {
        // 1. Get the target member to find boardId
        const targetMember = await prisma.boardMember.findUnique({ where: { id } });
        if (!targetMember) return res.status(404).json({ message: "Member not found" });

        // 2. Check Requester Role
        const requestorRole = await getRequesterRole(targetMember.boardId);

        // Only Admin or Owner can change roles
        if (requestorRole !== "Admin" && requestorRole !== "Owner") {
          return res.status(403).json({ message: "Forbidden: You must be an Admin to change roles" });
        }

        // Prevent changing Owner's role
        if (targetMember.role === "Owner") {
          return res.status(403).json({ message: "Cannot change the Owner's role" });
        }

        // Prevent assigning Admin role (Exclusive to Creator logic - strict)
        if (role === "Admin" && targetMember.role !== "Admin") {
          // Exception: If system allows promoting, validation goes here.
          // Current rule: "Admin role is exclusive to board creator"
          return res.status(403).json({ message: "Cannot assign Admin role (Exclusive to Owner)" });
        }

        const updatedMember = await prisma.boardMember.update({
          where: { id },
          data: { role },
        });

        // ✅ Log Activity
        await prisma.boardActivity.create({
          data: {
            boardId: updatedMember.boardId,
            user: "You",
            action: "changed role of",
            target: `${updatedMember.name} to ${role}`,
          }
        });

        return res.status(200).json(updatedMember);
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Failed to update member role" });
      }
    }

    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Member ID is required" });
      }

      const memberToDelete = await prisma.boardMember.findUnique({
        where: { id },
      });

      if (memberToDelete) {
        // Security Check
        const requestorRole = await getRequesterRole(memberToDelete.boardId);
        const user = await prisma.user.findUnique({ where: { id: requesterId } });

        // Allow if Admin/Owner OR if removing self
        const isRemovingSelf = user && (memberToDelete.name === user.name || memberToDelete.name === user.email);
        const isAdmin = requestorRole === "Admin" || requestorRole === "Owner";

        if (!isAdmin && !isRemovingSelf) {
          return res.status(403).json({ message: "Forbidden: You can only remove yourself or must be Admin" });
        }

        // Prevent deleting the Owner (unless they are deleting themselves? - usually board owner transfer is separate logic)
        // Assuming Owner cannot be simply removed this way for safety
        if (memberToDelete.role === "Owner") {
          return res.status(403).json({ message: "Cannot remove the Board Owner" });
        }


        await prisma.boardMember.delete({
          where: { id },
        });

        // ✅ Log Activity
        await prisma.boardActivity.create({
          data: {
            boardId: memberToDelete.boardId,
            user: "You",
            action: "removed member",
            target: memberToDelete.name,
          }
        });
      }

      return res.status(200).json({ message: "Member removed successfully" });
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
