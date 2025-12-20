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
      const updated = await prisma.taskComment.update({ where: { id: String(id) }, data: { content } });
      // publish
      publish(`task:${updated.taskId}`, { type: 'comment:updated', payload: updated });
      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      // find to get taskId
      const existing = await prisma.taskComment.findUnique({ where: { id: String(id) } });
      if (!existing) return res.status(404).json({ error: 'not found' });
      await prisma.taskComment.delete({ where: { id: String(id) } });
      // decrement comment counter
      try { await prisma.boardTask.update({ where: { id: existing.taskId }, data: { comments: { decrement: 1 } } }); } catch (e) { /* ignore */ }
      publish(`task:${existing.taskId}`, { type: 'comment:deleted', payload: { id: existing.id } });
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('comment/[id] api error', err);
    return res.status(500).json({ error: 'internal' });
  }
}
