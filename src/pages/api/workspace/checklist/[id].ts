// pages/api/workspace/checklist/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtime";

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
      const item = await prisma.checklistItem.findUnique({
        where: { id },
      });

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      return res.status(200).json(item);
    }

    if (req.method === "PUT") {
      const { text, isChecked, order } = req.body;

      const updateData: any = {};
      if (text !== undefined) updateData.text = text;
      if (isChecked !== undefined) updateData.isChecked = isChecked;
      if (order !== undefined) updateData.order = order;

      const item = await prisma.checklistItem.update({
        where: { id },
        data: updateData,
      });

      try {
        publish(`task:${item.taskId}`, { type: "checklist:updated", payload: item });
        const task = await prisma.boardTask.findUnique({ where: { id: item.taskId }, select: { columnId: true } });
        if (task?.columnId) {
          const col = await prisma.boardColumn.findUnique({ where: { id: task.columnId }, select: { boardId: true } });
          if (col?.boardId) publish(String(col.boardId), { type: "checklist:updated", payload: { taskId: item.taskId, item } });
        }
      } catch (e) { console.error(e); }

      return res.status(200).json(item);
    }

    if (req.method === "DELETE") {
      // fetch existing to get taskId
      const existing = await prisma.checklistItem.findUnique({ where: { id }, select: { taskId: true } });
      await prisma.checklistItem.delete({ where: { id } });
      try {
        if (existing?.taskId) {
          publish(`task:${existing.taskId}`, { type: "checklist:deleted", payload: { id } });
        }
      } catch (e) { console.error(e); }
      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
