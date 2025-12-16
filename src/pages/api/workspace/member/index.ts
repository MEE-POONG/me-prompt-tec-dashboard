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

      return res.status(200).json(members);
    }

    if (req.method === "POST") {
      const { boardId, name, role, avatar, color } = req.body;

      if (!boardId || !name || !role) {
        return res
          .status(400)
          .json({ message: "boardId, name, and role are required" });
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

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
