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
      const { boardId, taskId, limit } = req.query as {
        boardId?: string;
        taskId?: string;
        limit?: string;
      };

      if (!boardId) {
        return res.status(400).json({ message: "boardId is required" });
      }

      const where: any = { boardId };
      if (taskId) where.taskId = taskId;

      const activities = await prisma.boardActivity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit ? parseInt(limit) : 50,
      });

      // Fetch users to map avatars
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, avatar: true },
      });

      const activitiesWithAvatars = activities.map((act) => {
        const user = users.find(
          (u) =>
            (u.email && u.email.toLowerCase() === act.user.toLowerCase()) ||
            (u.name && u.name.trim() === act.user.trim())
        );
        return {
          ...act,
          user: user
            ? {
                id: user.id,
                name: user.name || user.email,
                avatar: user.avatar,
              }
            : act.user,
        };
      });

      return res.status(200).json(activitiesWithAvatars);
    }

    if (req.method === "POST") {
      const { boardId, user, action, target, projectId, taskId } = req.body;

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
          taskId: taskId || undefined,
        },
      });

      // map user for publish
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: user }, { name: user }],
        },
        select: { id: true, name: true, avatar: true },
      });

      const responseData = {
        ...activity,
        user: dbUser
          ? {
              id: dbUser.id,
              name: dbUser.name || user,
              avatar: dbUser.avatar,
            }
          : user,
      };

      try {
        publish(String(boardId), {
          type: "activity:created",
          payload: responseData,
        });
      } catch (e) {
        console.error(e);
      }
      try {
        if (taskId)
          publish(`task:${taskId}`, {
            type: "activity:created",
            payload: responseData,
          });
      } catch (e) {
        console.error(e);
      }
      return res.status(201).json(responseData);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
