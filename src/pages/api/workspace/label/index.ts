// pages/api/workspace/label/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method === "GET") {
            const { boardId } = req.query as { boardId?: string };

            if (!boardId) {
                return res.status(400).json({ message: "boardId is required" });
            }

            const labels = await prisma.boardLabel.findMany({
                where: { boardId },
                orderBy: { name: "asc" },
            });

            return res.status(200).json(labels);
        }

        if (req.method === "POST") {
            const { boardId, name, color, bgColor, textColor } = req.body;

            if (!boardId || !name || !color) {
                return res
                    .status(400)
                    .json({ message: "boardId, name, and color are required" });
            }

            // Create or update existing label atomically (avoid unique constraint errors)
            try {
                const label = await prisma.boardLabel.upsert({
                    where: { boardId_name: { boardId, name } },
                    update: {
                        color,
                        bgColor: bgColor || "bg-slate-100",
                        textColor: textColor || "text-slate-700",
                    },
                    create: {
                        boardId,
                        name,
                        color,
                        bgColor: bgColor || "bg-slate-100",
                        textColor: textColor || "text-slate-700",
                    },
                });

                // Return 200 for existing/updated label and 201 for create isn't reliably detectable from upsert, so return 200 with the label
                return res.status(200).json(label);
            } catch (err: any) {
                console.error(err);
                // Fallback: if unique constraint somehow still occurs, try to return the existing label
                if (err?.code === 'P2002') {
                    try {
                        const existing = await prisma.boardLabel.findUnique({
                            where: { boardId_name: { boardId, name } },
                        });
                        if (existing) return res.status(200).json(existing);
                        return res.status(409).json({ message: 'Label already exists' });
                    } catch (e) {
                        console.error('fallback findUnique failed', e);
                    }
                }

                return res.status(500).json({ message: 'Server error' });
            }
        }

        return res.status(405).json({ message: "Method Not Allowed" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}
