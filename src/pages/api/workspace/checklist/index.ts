// pages/api/workspace/checklist/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtime";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const { taskId } = req.query as { taskId?: string };

      if (!taskId) {
        return res.status(400).json({ message: "taskId is required" });
      }

      const items = await prisma.checklistItem.findMany({
        where: { taskId },
        orderBy: { order: "asc" },
      });

      return res.status(200).json(items);
    }

    if (req.method === "POST") {
      const { taskId, text, isChecked, order } = req.body;

      if (!taskId || !text) {
        return res
          .status(400)
          .json({ message: "taskId and text are required" });
      }

      const item = await prisma.checklistItem.create({
        data: {
          taskId,
          text,
          isChecked: isChecked || false,
          order: order ?? 0,
        },
      });

      // publish to task-specific channel and board channel (if available)
      try {
        publish(`task:${taskId}`, { type: "checklist:created", payload: item });
        const task = await prisma.boardTask.findUnique({ where: { id: taskId }, select: { columnId: true } });
        if (task?.columnId) {
          const col = await prisma.boardColumn.findUnique({ where: { id: task.columnId }, select: { boardId: true } });
          if (col?.boardId) publish(String(col.boardId), { type: "checklist:created", payload: { taskId, item } });
        }
      } catch (e) { console.error(e); }

      return res.status(201).json(item);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
