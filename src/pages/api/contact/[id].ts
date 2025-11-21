import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    // GET By ID
    if (req.method === "GET") {
      const message = await prisma.contactMessage.findUnique({
        where: { id },
        include: {
          handledBy: {
            select: { name: true },
          },
        },
      });

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      return res.status(200).json(message);
    }

    if (req.method === "PUT") {
      const { status } = req.body;

      const updated = await prisma.contactMessage.update({
        where: { id },
        data: { status },
      });

      return res.status(200).json(updated);
    }

    // DELETE
    if (req.method === "DELETE") {
      const deleted = await prisma.contactMessage.delete({
        where: { id },
      });

      return res.status(200).json({
        message: "Deleted successfully",
        data: deleted,
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("DELETE/GET id error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
