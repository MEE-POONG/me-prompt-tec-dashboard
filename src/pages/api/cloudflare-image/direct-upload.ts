import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import fetch from "node-fetch";

/**
 * API สำหรับขอ Direct Upload URL จาก Cloudflare
 * Client จะใช้ URL นี้ในการอัปโหลดรูปตรงไปที่ Cloudflare
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;

        if (!accountId || !apiToken) {
            return res.status(500).json({
                error: "Cloudflare credentials not configured",
            });
        }

        // ดึง metadata จาก request body
        const { relatedType, relatedId, fieldName, tags } = req.body;

        console.log("🔑 Requesting Direct Upload URL from Cloudflare...");

        // ขอ Direct Upload URL จาก Cloudflare
        const cfResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    requireSignedURLs: false,
                    metadata: {
                        relatedType: relatedType || "",
                        relatedId: relatedId || "",
                        fieldName: fieldName || "",
                    },
                }),
                // @ts-ignore
                timeout: 30000,
            }
        );

        if (!cfResponse.ok) {
            const errorText = await cfResponse.text();
            console.error("❌ Cloudflare API error:", errorText);
            return res.status(cfResponse.status).json({
                error: "Failed to get upload URL from Cloudflare",
                details: errorText,
            });
        }

        const cfData = (await cfResponse.json()) as {
            success: boolean;
            result: {
                id: string;
                uploadURL: string;
            };
            errors: any[];
        };

        if (!cfData.success) {
            console.error("❌ Cloudflare API returned error:", cfData.errors);
            return res.status(500).json({
                error: "Cloudflare API error",
                details: cfData.errors,
            });
        }

        console.log("✅ Got Direct Upload URL:", cfData.result.id);

        // บันทึกข้อมูลเบื้องต้นลง Database (status: pending)
        const now = new Date();
        const imageRecord = await prisma.cloudflareImage.create({
            data: {
                cloudflareId: cfData.result.id,
                filename: "pending",
                publicUrl: "",
                variants: [],
                size: 0,
                format: "pending",
                relatedType: relatedType || null,
                relatedId: relatedId || null,
                fieldName: fieldName || null,
                tags: tags || [],
                isActive: false, // จะเปลี่ยนเป็น true หลัง upload สำเร็จ
                createdAt: now,
                updatedAt: now,
            },
        });

        return res.status(200).json({
            success: true,
            data: {
                uploadURL: cfData.result.uploadURL,
                imageId: cfData.result.id,
                recordId: imageRecord.id,
            },
        });
    } catch (error: any) {
        console.error("❌ Direct Upload API error:", error);
        return res.status(500).json({
            error: "Internal server error",
            message: error.message,
            code: error.code,
        });
    }
}
