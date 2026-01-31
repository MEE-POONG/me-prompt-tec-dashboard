import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({});

    const [fields, files] = await form.parse(req);

    const fileArg = files.file?.[0];

    if (!fileArg) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the file into a buffer to create a Blob (native Node/Web API)
    const fileBuffer = fs.readFileSync(fileArg.filepath);
    const blob = new Blob([fileBuffer], { type: fileArg.mimetype || 'application/octet-stream' });

    // Use native FormData
    const cloudflareFormData = new FormData();
    cloudflareFormData.append('file', blob, fileArg.originalFilename || 'upload.jpg');

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return res.status(500).json({ error: 'Missing Cloudflare credentials' });
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          // Content-Type header is set automatically by fetch when body is FormData
        },
        body: cloudflareFormData,
      }
    );

    const data: any = await response.json();

    if (!response.ok || !data.success) {
      const errorMessage = data?.errors?.[0]?.message || 'Upload failed with Cloudflare';
      throw new Error(errorMessage);
    }

    const result = data.result;

    return res.status(200).json({
      success: true,
      imageUrl: result.id,
      variants: result.variants,
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Upload failed', success: false });
  }
}
