import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getAuthToken } from "@/lib/auth/cookies";
import { verifyToken } from "@/lib/auth/jwt";

// Helper to handle BigInt serialization
(BigInt.prototype as any).toJSON = function () {
    return Number(this);
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // 1. Auth Check
        const token = getAuthToken(req.headers.cookie || "");
        const decoded = token ? verifyToken(token) : null;
        const requesterId = decoded?.userId;

        if (!requesterId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // 2. Fetch Users with loose typing
        const users = await (prisma.user.findMany as any)({
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                position: true,
            },
            orderBy: {
                name: 'asc'
            },
            where: {
                isActive: true
            }
        });

        return res.status(200).json(users);
    } catch (error: any) {
        console.error("Failed to fetch users:", error);
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}
