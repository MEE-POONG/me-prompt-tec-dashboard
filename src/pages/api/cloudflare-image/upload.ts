import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * API handler to upload an image to Cloudflare Images.
 * Returns the Cloudflare Image details (ID, URL, variants).
 * This endpoint does NOT interact with the database.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log('[UploadAPI] Starting upload process...');

    // Ensure upload directory exists if needed by formidable (default uses os.tmpdir)
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 20 * 1024 * 1024, // 20MB
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const fileArg = files.file?.[0];

    if (!fileArg) {
      console.error('[UploadAPI] No file received');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`[UploadAPI] File received: ${fileArg.originalFilename} (${fileArg.size} bytes) at ${fileArg.filepath}`);

    // Read file buffer
    let fileBuffer;
    try {
      fileBuffer = fs.readFileSync(fileArg.filepath);
    } catch (readErr: any) {
      console.error('[UploadAPI] Error reading file:', readErr);
      return res.status(500).json({ error: 'Failed to read uploaded file' });
    }

    const blob = new Blob([fileBuffer], { type: fileArg.mimetype || 'application/octet-stream' });
    console.log(`[UploadAPI] Blob created via Buffer, size: ${blob.size}`);

    // Prepare Cloudflare FormData
    const cloudflareFormData = new FormData();
    cloudflareFormData.append('file', blob, fileArg.originalFilename || 'upload.jpg');

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      console.error('[UploadAPI] Missing Credentials');
      return res.status(500).json({ error: 'Cloudflare credentials missing' });
    }

    const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;
    console.log(`[UploadAPI] Sending to Cloudflare: ${cfUrl}`);

    // Upload to Cloudflare
    const response = await fetch(cfUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
      body: cloudflareFormData,
      // @ts-ignore - Required for large files in some node versions with fetch
      duplex: 'half',
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[UploadAPI] Failed to parse CF response:', responseText);
      throw new Error('Invalid response from Cloudflare');
    }

    if (!response.ok || !data.success) {
      console.error('[UploadAPI] Cloudflare Error:', data.errors);
      throw new Error(data?.errors?.[0]?.message || 'Upload failed with Cloudflare');
    }

    const result = data.result;
    console.log('[UploadAPI] Upload Success:', result.id);

    return res.status(200).json({
      success: true,
      data: {
        id: result.id,
        filename: result.filename,
        uploaded: result.uploaded,
        requireSignedURLs: result.requireSignedURLs,
        variants: result.variants,
      },
    });

  } catch (error: any) {
    console.error('[UploadAPI] Exception:', error);
    return res.status(500).json({ success: false, error: error.message || 'Upload failed' });
  }
}
