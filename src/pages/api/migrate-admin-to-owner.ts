import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        console.log('🔄 Starting migration: Admin → Owner...');

        // Update all members with role "Admin" to "Owner"
        const result = await prisma.workspaceMember.updateMany({
            where: {
                role: 'Admin'
            },
            data: {
                role: 'Owner'
            }
        });

        console.log(`✅ Migration complete! Updated ${result.count} members.`);

        // Get updated members
        const updatedMembers = await prisma.workspaceMember.findMany({
            where: {
                role: 'Owner'
            },
            select: {
                id: true,
                name: true,
                role: true,
                board: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: `Migration complete! Updated ${result.count} members from Admin to Owner.`,
            updatedCount: result.count,
            updatedMembers: updatedMembers.map(m => ({
                name: m.name,
                role: m.role,
                boardName: m.board?.name || 'N/A'
            }))
        });

    } catch (error) {
        console.error('❌ Migration failed:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Migration failed'
        });
    }
}
