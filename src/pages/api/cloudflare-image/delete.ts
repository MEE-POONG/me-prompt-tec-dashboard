import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Allow POST or DELETE methods
    if (req.method !== 'POST' && req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageId } = req.body;

        if (!imageId) {
            return res.status(400).json({ error: 'imageId is required' });
        }

        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;

        if (!accountId || !apiToken) {
            return res.status(500).json({ error: 'Missing Cloudflare credentials' });
        }

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                },
            }
        );

        // If 404, valid it's already gone, treat as success
        if (response.status === 404) {
            return res.status(200).json({ success: true, message: "Image not found, considered deleted" });
        }

        const data: any = await response.json();

        if (!response.ok || !data.success) {
            const errorMessage = data?.errors?.[0]?.message || 'Delete failed with Cloudflare';
            throw new Error(errorMessage);
        }

        return res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('Delete error:', error);
        return res.status(500).json({ error: error.message || 'Delete failed', success: false });
    }
}
