import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

/**
 * API สำหรับ Confirm ว่า Direct Upload สำเร็จแล้ว
 * Client จะเรียกหลังจากอัปโหลดรูปไปที่ Cloudflare สำเร็จ
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { recordId, cloudflareId, filename } = req.body;

        if (!recordId || !cloudflareId) {
            return res.status(400).json({
                error: "Missing required fields: recordId, cloudflareId",
            });
        }

        console.log("✅ Confirming Direct Upload:", { recordId, cloudflareId });

        // สร้าง Public URL
        const cfImg = process.env.CFIMG || "https://imagedelivery.net";
        const cfKey = process.env.CLOUDFLARE_KEY || "";
        const publicUrl = `${cfImg}/${cfKey}/${cloudflareId}/public`;

        // อัปเดต record ในฐานข้อมูล
        const updatedRecord = await prisma.cloudflareImage.update({
            where: { id: recordId },
            data: {
                filename: filename || "uploaded",
                publicUrl: publicUrl,
                variants: [
                    `${cfImg}/${cfKey}/${cloudflareId}/public`,
                    `${cfImg}/${cfKey}/${cloudflareId}/thumbnail`,
                ],
                isActive: true,
            },
        });

        console.log("✅ Upload confirmed:", updatedRecord.id);

        return res.status(200).json({
            success: true,
            data: {
                id: updatedRecord.id,
                cloudflareId: updatedRecord.cloudflareId,
                filename: updatedRecord.filename,
                publicUrl: updatedRecord.publicUrl,
                variants: updatedRecord.variants,
                relatedType: updatedRecord.relatedType,
                relatedId: updatedRecord.relatedId,
                fieldName: updatedRecord.fieldName,
                tags: updatedRecord.tags,
                isActive: updatedRecord.isActive,
                createdAt: updatedRecord.createdAt,
                updatedAt: updatedRecord.updatedAt,
            },
        });
    } catch (error: any) {
        console.error("❌ Confirm Upload API error:", error);
        return res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
}
