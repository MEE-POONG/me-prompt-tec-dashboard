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
      });

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      return res.status(200).json(message);
    }

    // PUT (Update)
    if (req.method === "PUT") {
      const {
        status,
        name,
        email,
        phone,
        subject,
        message,
        resumeUrl,
        portfolioUrl,
        handledById,
        isStarred, // ✅ 1. เพิ่มการรับค่า isStarred
      } = req.body;

      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (subject !== undefined) updateData.subject = subject;
      if (message !== undefined) updateData.message = message;
      if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;
      if (portfolioUrl !== undefined) updateData.portfolioUrl = portfolioUrl;
      if (handledById !== undefined) updateData.handledById = handledById;

      // ✅ 2. เพิ่ม logic อัปเดตลง Database
      if (isStarred !== undefined) updateData.isStarred = isStarred;

      const updated = await prisma.contactMessage.update({
        where: { id },
        data: updateData,
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
    console.error("DELETE/GET/PUT id error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}