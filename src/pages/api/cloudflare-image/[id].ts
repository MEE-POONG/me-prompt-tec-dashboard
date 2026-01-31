import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { deleteImageFromCloudflare } from './delete'; // Import logic from delete.ts

/**
 * Database Handler for Single Image Operations.
 * - GET: Get image details by DB ID.
 * - DELETE: Delete image from DB AND Cloudflare.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const method = req.method;

  if (method === 'GET') {
    try {
      const image = await prisma.cloudflareImage.findUnique({
        where: { id: id },
      });

      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      return res.status(200).json(image);
    } catch (error: any) {
      console.error('DB Get Error:', error);
      return res.status(500).json({ error: 'Failed to retrieve image' });
    }
  }

  if (method === 'DELETE') {
    try {
      // 1. Get Image Info to find Cloudflare ID
      const image = await prisma.cloudflareImage.findUnique({
        where: { id: id },
      });

      if (!image) {
        return res.status(404).json({ error: 'Image not found in database' });
      }

      // 2. Delete from Cloudflare (using shared logic)
      if (image.cloudflareId) {
        try {
          await deleteImageFromCloudflare(image.cloudflareId);
        } catch (cfError) {
          console.warn('Failed to delete from Cloudflare (might be already gone):', cfError);
          // Continue to delete from DB regardless
        }
      }

      // 3. Delete from Database
      await prisma.cloudflareImage.delete({
        where: { id: id },
      });

      return res.status(200).json({ success: true, message: 'Image deleted successfully' });

    } catch (error: any) {
      console.error('DB Delete Error:', error);
      return res.status(500).json({ error: error.message || 'Delete failed' });
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
