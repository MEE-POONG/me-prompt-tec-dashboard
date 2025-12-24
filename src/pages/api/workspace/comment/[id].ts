import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { publish } from '@/lib/realtime';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'id required' });
  
  try {
    if (req.method === 'PUT') {
      const { content } = req.body;
      if (content === undefined) return res.status(400).json({ error: 'content required' });
      
      const updated = await prisma.taskComment.update({ 
          where: { id: String(id) }, 
          data: { content },
          include: {
            task: {
                include: { column: true }
            }
          }
      });

      // ✅ Publish Event
      const boardId = updated.task?.column?.boardId;
      if (boardId) {
          publish(String(boardId), { type: 'comment:updated', payload: updated });
      }
      
      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      // Find existing to get taskId and BoardId
      const existing = await prisma.taskComment.findUnique({ 
          where: { id: String(id) },
          include: {
            task: {
                include: { column: true }
            }
          } 
      });

      if (!existing) return res.status(404).json({ error: 'not found' });
      
      await prisma.taskComment.delete({ where: { id: String(id) } });
      
      // Decrement comment counter
      try { await prisma.boardTask.update({ where: { id: existing.taskId }, data: { comments: { decrement: 1 } } }); } catch (e) { /* ignore */ }
      
      // ✅ Publish Event
      const boardId = existing.task?.column?.boardId;
      if (boardId) {
          publish(String(boardId), { type: 'comment:deleted', payload: { id: existing.id } });
      }

      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('comment/[id] api error', err);
    return res.status(500).json({ error: 'internal' });
  }
}