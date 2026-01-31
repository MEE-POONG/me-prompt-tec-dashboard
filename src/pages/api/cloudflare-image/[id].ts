import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const method = req.method;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

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
      console.error('Get image error:', error);
      return res.status(500).json({ error: 'Failed to retrieve image' });
    }
  }

  if (method === 'DELETE') {
    if (!accountId || !apiToken) {
      return res.status(500).json({ error: 'Missing Cloudflare credentials' });
    }

    try {
      // 1. Find image in DB to get Cloudflare ID
      const image = await prisma.cloudflareImage.findUnique({
        where: { id: id },
      });

      if (!image) {
        return res.status(404).json({ error: 'Image not found in database' });
      }

      // 2. Delete from Cloudflare
      const cfResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${image.cloudflareId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
          },
        }
      );

      // We allow 404 from Cloudflare if the image was already deleted there manually
      if (!cfResponse.ok && cfResponse.status !== 404) {
        const cfData: any = await cfResponse.json();
        const errorMessage = cfData?.errors?.[0]?.message || 'Delete failed with Cloudflare';
        throw new Error(errorMessage);
      }

      // 3. Delete from Database
      await prisma.cloudflareImage.delete({
        where: { id: id },
      });

      return res.status(200).json({ success: true, message: 'Image deleted successfully' });

    } catch (error: any) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: error.message || 'Delete failed', success: false });
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
