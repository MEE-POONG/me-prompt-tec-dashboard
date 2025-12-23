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

            const label = await prisma.boardLabel.create({
                data: {
                    boardId,
                    name,
                    color,
                    bgColor: bgColor || "bg-slate-100",
                    textColor: textColor || "text-slate-700",
                },
            });

            return res.status(201).json(label);
        }

        return res.status(405).json({ message: "Method Not Allowed" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}
