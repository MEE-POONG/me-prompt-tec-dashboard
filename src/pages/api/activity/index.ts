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
        data: { boardId, user, action, target, projectId, taskId },
      });

      // ✅ 2. เพิ่มส่วนนี้: บันทึก Notification ลง DB ด้วย
      let notifType = "update";
      const actLower = action.toLowerCase();
      if (actLower.includes("create")) notifType = "create";
      else if (actLower.includes("delete")) notifType = "delete";
      else if (actLower.includes("comment")) notifType = "comment";

      await prisma.notification.create({
        data: {
          boardId,
          actorName: user,
          action,
          target,
          type: notifType,
          isRead: false, // ยังไม่อ่าน
        }
      });

      // 3. ส่ง Realtime (เหมือนเดิม แต่ไม่ต้องส่ง Notification Object ไปแล้ว ให้ Frontend ดึงเอง หรือส่งไปแค่ trigger)
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