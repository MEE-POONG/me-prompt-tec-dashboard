// pages/api/workspace/label/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query as { id: string };

    try {
        if (req.method === "PUT") {
            const { name, color, bgColor, textColor } = req.body;

            const label = await prisma.boardLabel.update({
                where: { id },
                data: {
                    name,
                    color,
                    bgColor,
                    textColor,
                },
            });

            return res.status(200).json(label);
        }

        if (req.method === "DELETE") {
            await prisma.boardLabel.delete({
                where: { id },
            });

            return res.status(204).end();
        }

        return res.status(405).json({ message: "Method Not Allowed" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}
