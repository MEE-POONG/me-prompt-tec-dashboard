// pages/api/workspace/member/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

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
      const member = await prisma.boardMember.findUnique({
        where: { id },
        include: {
          board: true,
        },
      });

      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      return res.status(200).json(member);
    }

    if (req.method === "PUT") {
      const { name, role, avatar, color } = req.body;

      const member = await prisma.boardMember.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(role !== undefined && { role }),
          ...(avatar !== undefined && { avatar }),
          ...(color !== undefined && { color }),
        },
      });

      return res.status(200).json(member);
    }

    if (req.method === "DELETE") {
      await prisma.boardMember.delete({
        where: { id },
      });

      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
