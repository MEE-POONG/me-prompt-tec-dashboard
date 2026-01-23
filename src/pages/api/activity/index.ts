// pages/api/workspace/activity/index.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtime";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // ... GET Method (เหมือนเดิม)

    if (req.method === "POST") {
      const { boardId, user, action, target, projectId, taskId } = req.body;

      if (!boardId || !user || !action || !target) {
        return res.status(400).json({ message: "Required fields missing" });
      }

      // 1. บันทึก Activity Log (เหมือนเดิม)
      const activity = await prisma.boardActivity.create({
        data: {
          boardId,
          user,
          action,
          target,
          projectId,
          taskId,
          createdAt: new Date(),
        },
      });

      // 2. ส่ง Realtime
      try {
        publish(String(boardId), { type: "activity:created", payload: activity });
      } catch (e) { console.error(e); }

      return res.status(201).json(activity);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}