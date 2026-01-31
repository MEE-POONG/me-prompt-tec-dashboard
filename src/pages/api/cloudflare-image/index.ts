import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  if (method === 'GET') {
    try {
      const images = await prisma.cloudflareImage.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(images);
    } catch (error: any) {
      console.error('Fetch images error:', error);
      return res.status(500).json({ error: 'Failed to fetch images' });
    }
  }

  if (method === 'POST') {
    try {
      const form = formidable({});
      const [fields, files] = await form.parse(req);

      const fileArg = files.file?.[0];

      if (!fileArg) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Read file
      const fileBuffer = fs.readFileSync(fileArg.filepath);
      const blob = new Blob([fileBuffer], { type: fileArg.mimetype || 'application/octet-stream' });

      // Prepare fields for DB
      const relatedIdRaw = fields.relatedId?.[0];
      const relatedType = fields.relatedType?.[0] || null;
      const fieldName = fields.fieldName?.[0] || null;
      const uploadedBy = fields.uploadedBy?.[0] || 'System';
      let tags: any = [];
      try {
        if (fields.tags?.[0]) {
          tags = JSON.parse(fields.tags[0]);
        }
      } catch (e) {
        // ignore JSON parse error
      }

      // Upload to Cloudflare
      const cloudflareFormData = new FormData();
      cloudflareFormData.append('file', blob, fileArg.originalFilename || 'upload.jpg');

      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const apiToken = process.env.CLOUDFLARE_API_TOKEN;

      if (!accountId || !apiToken) {
        return res.status(500).json({ error: 'Missing Cloudflare credentials' });
      }

      const cfResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
          },
          body: cloudflareFormData,
        }
      );

      const cfData: any = await cfResponse.json();

      if (!cfResponse.ok || !cfData.success) {
        const errorMessage = cfData?.errors?.[0]?.message || 'Upload failed with Cloudflare';
        throw new Error(errorMessage);
      }

      const result = cfData.result;

      // Save to Database
      // Handle relatedId: simple validation if it looks like an ObjectId or just pass if valid
      // Prisma ObjectId validation might fail if string is not valid hex.
      // We will assume relatedId is provided correctly or filter if valid.

      const newImage = await prisma.cloudflareImage.create({
        data: {
          cloudflareId: result.id,
          filename: result.filename || fileArg.originalFilename || 'unknown',
          format: fileArg.mimetype?.split('/')[1] || 'unknown',
          size: fileArg.size, // form-data file size
          publicUrl: result.variants?.[0] || '',
          variants: result.variants || [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          uploadedBy: uploadedBy,
          relatedId: relatedIdRaw || undefined, // undefined to skip if empty
          relatedType: relatedType,
          fieldName: fieldName,
          tags: tags,
        },
      });

      return res.status(201).json({
        success: true,
        data: newImage,
      });

    } catch (error: any) {
      console.error('Upload/Save error:', error);
      return res.status(500).json({ error: error.message || 'Operation failed', success: false });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
