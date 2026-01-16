import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Enable CORS for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { sessionId, page, referrer, userAgent } = req.body;

        // Validation
        if (!sessionId || !page) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Get IP address
        const ipAddress =
            (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
            (req.headers["x-real-ip"] as string) ||
            req.socket.remoteAddress ||
            null;

        // Create page view record
        await prisma.pageView.create({
            data: {
                sessionId,
                page,
                referrer: referrer || null,
                userAgent: userAgent || null,
                ipAddress,
            },
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Analytics tracking error:", error);
        return res.status(500).json({ error: "Failed to track page view" });
    }
}
