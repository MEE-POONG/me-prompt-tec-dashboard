import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Shared function to delete image from Cloudflare.
 * Can be used by this API handler or other API routes (like [id].ts).
 */
export async function deleteImageFromCloudflare(cloudflareId: string) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
        throw new Error('Cloudflare credentials missing');
    }

    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${cloudflareId}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
            },
        }
    );

    // If 404, assume already deleted
    if (response.status === 404) {
        return true;
    }

    const data: any = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data?.errors?.[0]?.message || 'Cloudflare delete failed');
    }

    return true;
}

/**
 * API handler to delete an image from Cloudflare by Cloudflare ID.
 * Expects JSON body: { "cloudflareId": "..." }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST' && req.method !== 'DELETE') {
        res.setHeader('Allow', ['POST', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        // Support getting ID from body (POST) or Query (DELETE)
        let cloudflareId = req.body.cloudflareId;
        if (!cloudflareId && req.query.cloudflareId) {
            cloudflareId = req.query.cloudflareId as string;
        }

        if (!cloudflareId) {
            return res.status(400).json({ error: 'cloudflareId is required' });
        }

        await deleteImageFromCloudflare(cloudflareId);

        return res.status(200).json({ success: true, message: 'Image deleted from Cloudflare' });

    } catch (error: any) {
        console.error('Delete Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
