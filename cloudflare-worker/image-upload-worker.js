/**
 * Cloudflare Worker สำหรับ Image Upload Proxy
 * ทำหน้าที่ขอ Direct Upload URL และ Proxy การอัปโหลดไปยัง Cloudflare Images
 * 
 * วิธี Deploy:
 * 1. ไปที่ Cloudflare Dashboard > Workers & Pages
 * 2. สร้าง Worker ใหม่
 * 3. วางโค้ดนี้ลงไป
 * 4. ตั้ง Environment Variables:
 *    - CLOUDFLARE_ACCOUNT_ID
 *    - CLOUDFLARE_API_TOKEN
 *    - CFIMG (เช่น https://imagedelivery.net)
 *    - CLOUDFLARE_KEY (Cloudflare Images Key)
 * 5. Deploy
 */

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        const url = new URL(request.url);

        try {
            // Route: GET /health - Health check
            if (url.pathname === '/health') {
                return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
            }

            // Route: POST /get-upload-url - ขอ Direct Upload URL
            if (url.pathname === '/get-upload-url' && request.method === 'POST') {
                return await handleGetUploadUrl(request, env);
            }

            // Route: POST /confirm-upload - Confirm upload สำเร็จ
            if (url.pathname === '/confirm-upload' && request.method === 'POST') {
                return await handleConfirmUpload(request, env);
            }

            return jsonResponse({ error: 'Not Found' }, 404);
        } catch (error) {
            console.error('Worker Error:', error);
            return jsonResponse({
                error: 'Internal Server Error',
                message: error.message
            }, 500);
        }
    },
};

/**
 * ขอ Direct Upload URL จาก Cloudflare Images
 */
async function handleGetUploadUrl(request, env) {
    const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = env;

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
        return jsonResponse({
            error: 'Missing Cloudflare credentials in Worker environment'
        }, 500);
    }

    const body = await request.json().catch(() => ({}));
    const { relatedType, relatedId, fieldName } = body;

    console.log('Requesting Direct Upload URL...');

    const cfResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requireSignedURLs: false,
                metadata: {
                    relatedType: relatedType || '',
                    relatedId: relatedId || '',
                    fieldName: fieldName || '',
                },
            }),
        }
    );

    if (!cfResponse.ok) {
        const errorText = await cfResponse.text();
        console.error('Cloudflare API error:', errorText);
        return jsonResponse({
            error: 'Failed to get upload URL from Cloudflare',
            details: errorText
        }, cfResponse.status);
    }

    const cfData = await cfResponse.json();

    if (!cfData.success) {
        console.error('Cloudflare API returned error:', cfData.errors);
        return jsonResponse({
            error: 'Cloudflare API error',
            details: cfData.errors
        }, 500);
    }

    console.log('Got Direct Upload URL:', cfData.result.id);

    return jsonResponse({
        success: true,
        data: {
            uploadURL: cfData.result.uploadURL,
            imageId: cfData.result.id,
        },
    });
}

/**
 * สร้าง Public URL หลังจากอัปโหลดสำเร็จ
 */
async function handleConfirmUpload(request, env) {
    const { CFIMG, CLOUDFLARE_KEY } = env;

    const body = await request.json().catch(() => ({}));
    const { cloudflareId, filename } = body;

    if (!cloudflareId) {
        return jsonResponse({ error: 'Missing cloudflareId' }, 400);
    }

    const cfImgBase = CFIMG || 'https://imagedelivery.net';
    const cfKey = CLOUDFLARE_KEY || '';
    const publicUrl = `${cfImgBase}/${cfKey}/${cloudflareId}/public`;

    console.log('Confirm upload:', cloudflareId, '->', publicUrl);

    return jsonResponse({
        success: true,
        data: {
            id: cloudflareId,
            cloudflareId: cloudflareId,
            filename: filename || 'uploaded',
            publicUrl: publicUrl,
            variants: [
                `${cfImgBase}/${cfKey}/${cloudflareId}/public`,
                `${cfImgBase}/${cfKey}/${cloudflareId}/thumbnail`,
            ],
            isActive: true,
        },
    });
}

/**
 * Helper: JSON Response with CORS
 */
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
        },
    });
}
