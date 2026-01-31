import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

/**
 * Database Handler for Listing and Creating Images.
 * - GET: List all images from MongoDB.
 * - POST: Save image metadata to MongoDB (after client uploads to Cloudflare).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  if (method === 'GET') {
    try {
      const images = await prisma.cloudflareImage.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(images);
    } catch (error: any) {
      console.error('DB List Error:', error);
      return res.status(500).json({ error: 'Failed to fetch images' });
    }
  }

  if (method === 'POST') {
    try {
      // Expecting JSON body with image details
      const body = req.body;

      // Validation
      if (!body.cloudflareId || !body.publicUrl) {
        return res.status(400).json({ error: 'Missing required fields (cloudflareId, publicUrl)' });
      }

      const newImage = await prisma.cloudflareImage.create({
        data: {
          cloudflareId: body.cloudflareId,
          filename: body.filename || 'unknown',
          format: body.format || 'unknown',
          size: body.size || 0,
          publicUrl: body.publicUrl,
          variants: body.variants || [],
          isActive: true,
          uploadedBy: body.uploadedBy || 'System',
          relatedId: body.relatedId || undefined,
          relatedType: body.relatedType || null,
          fieldName: body.fieldName || null,
          tags: body.tags || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return res.status(201).json({ success: true, data: newImage });

    } catch (error: any) {
      console.error('DB Create Error:', error);
      // Check for unique constraint violation
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Image with this Cloudflare ID already exists' });
      }
      return res.status(500).json({ error: error.message || 'Failed to save to database' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
