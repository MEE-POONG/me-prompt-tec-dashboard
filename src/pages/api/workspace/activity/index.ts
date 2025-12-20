// pages/api/workspace/activity/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtime";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const { boardId, limit } = req.query as {
        boardId?: string;
        limit?: string;
      };

      if (!boardId) {
        return res.status(400).json({ message: "boardId is required" });
      }

      const activities = await prisma.boardActivity.findMany({
        where: { boardId },
        orderBy: { createdAt: "desc" },
        take: limit ? parseInt(limit) : 50,
      });

      return res.status(200).json(activities);
    }

    if (req.method === "POST") {
      const { boardId, user, action, target, projectId } = req.body;

      if (!boardId || !user || !action || !target) {
        return res.status(400).json({
          message: "boardId, user, action, and target are required",
        });
      }

      const activity = await prisma.boardActivity.create({
        data: {
          boardId,
          user,
          action,
          target,
          projectId,
        },
      });

      try { publish(String(boardId), { type: "activity:created", payload: activity }); } catch (e) { console.error(e); }
      return res.status(201).json(activity);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
