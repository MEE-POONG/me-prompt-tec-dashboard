import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtime";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const { taskId } = req.query;
      if (!taskId || Array.isArray(taskId))
        return res.status(400).json({ error: "taskId required" });
      const items = await prisma.taskComment.findMany({
        where: { taskId: String(taskId) },
        orderBy: { createdAt: "desc" },
      });

      // Fetch users to map avatars
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, avatar: true },
      });

      const itemsWithAvatars = items.map((item) => {
        const user = users.find(
          (u) =>
            (u.email && u.email.toLowerCase() === item.author.toLowerCase()) ||
            (u.name && u.name.trim() === item.author.trim())
        );
        return {
          ...item,
          user: user
            ? {
                id: user.id,
                name: user.name || user.email,
                avatar: user.avatar,
              }
            : item.author,
        };
      });

      return res.json(itemsWithAvatars);
    }

    if (req.method === "POST") {
      const { taskId, content, author } = req.body;
      if (!taskId || !content)
        return res.status(400).json({ error: "taskId and content required" });

      const created = await prisma.taskComment.create({
        data: {
          taskId: String(taskId),
          content,
          author: author || "Anonymous",
        },
        // Include เพื่อหา boardId
        include: {
          task: {
            include: {
              column: true,
            },
          },
        },
      });

      // Increment task comment count
      try {
        await prisma.boardTask.update({
          where: { id: String(taskId) },
          data: { comments: { increment: 1 } },
        });
      } catch (e) {
        /* ignore */
      }

      // map user for publish
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: author }, { name: author }],
        },
        select: { id: true, name: true, avatar: true },
      });

      const responseData = {
        ...created,
        user: user
          ? {
              id: user.id,
              name: user.name || author,
              avatar: user.avatar,
            }
          : author,
      };

      // ✅ Publish Notification
      const boardId = created.task?.column?.boardId;
      if (boardId) {
        publish(String(boardId), {
          type: "comment:created",
          payload: responseData,
          // Notification Data
          user: author || "System",
          action: "commented on",
          target: created.task?.title || "task",
        });
      }

      return res.status(201).json(responseData);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("comment api error", err);
    return res.status(500).json({ error: "internal" });
  }
}
