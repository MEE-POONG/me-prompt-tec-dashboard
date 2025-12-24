import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { publish } from '@/lib/realtime';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { taskId } = req.query;
      if (!taskId || Array.isArray(taskId)) return res.status(400).json({ error: 'taskId required' });
      const items = await prisma.taskComment.findMany({ where: { taskId: String(taskId) }, orderBy: { createdAt: 'desc' } });
      return res.json(items);
    }

    if (req.method === 'POST') {
      const { taskId, content, author } = req.body;
      if (!taskId || !content) return res.status(400).json({ error: 'taskId and content required' });
      
      const created = await prisma.taskComment.create({ 
          data: { 
              taskId: String(taskId), 
              content, 
              author: author || 'Anonymous' 
          },
          // Include เพื่อหา boardId
          include: {
            task: {
                include: {
                    column: true
                }
            }
          }
      });

      // Increment task comment count
      try { await prisma.boardTask.update({ where: { id: String(taskId) }, data: { comments: { increment: 1 } } }); } catch (e) { /* ignore */ }
      
      // ✅ Publish Notification
      // สำคัญ: ต้องส่งเข้า channel ของ board (ไม่ใช่ task) เพื่อให้ Header ได้รับ notification
      const boardId = created.task?.column?.boardId;
      if (boardId) {
          publish(String(boardId), { 
              type: 'comment:created', 
              payload: created,
              // Notification Data
              user: author || "System",
              action: "commented on",
              target: created.task?.title || "task"
          });
      }

      return res.status(201).json(created);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('comment api error', err);
    return res.status(500).json({ error: 'internal' });
  }
}