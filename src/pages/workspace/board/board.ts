import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // =======================
  // GET: ดึง workspace
  // =======================
  if (req.method === "GET") {
    try {
      const boards = await prisma.projectBoard.findMany({
        orderBy: { createdAt: "desc" },
      });

      console.log(
        "🧠 DB VISIBILITY:",
        boards.map((b) => b.visibility)
      );

      return res.status(200).json(boards);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Fetch failed" });
    }
  }

  // =======================
  // POST: สร้าง workspace
  // =======================
  if (req.method === "POST") {
    try {
      const { name, description, color, visibility } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name required" });
      }

      const finalVisibility =
        visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE";

      console.log("📥 BODY:", req.body);
      console.log("🔒 SAVE AS:", finalVisibility);

      const board = await prisma.projectBoard.create({
        data: {
          name,
          description: description || "",
          color: color || "#3B82F6",
          visibility: finalVisibility,
        },
      });

      return res.status(201).json(board);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Create failed" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}
