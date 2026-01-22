import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        console.log('🔄 Starting role fix: First member = Owner, Others = Editor...');

        // Get all boards
        const boards = await prisma.board.findMany({
            include: {
                members: {
                    orderBy: {
                        createdAt: 'asc' // เรียงตามเวลาสร้าง (คนแรกสุด)
                    }
                }
            }
        });

        let totalBoards = 0;
        let totalOwners = 0;
        let totalEditors = 0;
        const results = [];

        // Loop through each board
        for (const board of boards) {
            if (board.members.length === 0) continue;

            totalBoards++;

            // First member = Owner
            const firstMember = board.members[0];
            await prisma.boardMember.update({
                where: { id: firstMember.id },
                data: { role: 'Owner' }
            });
            totalOwners++;

            // Other members = Editor
            const otherMembers = board.members.slice(1);
            for (const member of otherMembers) {
                await prisma.boardMember.update({
                    where: { id: member.id },
                    data: { role: 'Editor' }
                });
                totalEditors++;
            }

            results.push({
                boardName: board.name,
                owner: firstMember.name,
                editorsCount: otherMembers.length
            });
        }

        console.log(`✅ Fix complete! ${totalBoards} boards, ${totalOwners} owners, ${totalEditors} editors.`);

        return res.status(200).json({
            success: true,
            message: `Role fix complete! Updated ${totalBoards} boards.`,
            summary: {
                totalBoards,
                totalOwners,
                totalEditors
            },
            boards: results
        });

    } catch (error) {
        console.error('❌ Fix failed:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Fix failed'
        });
    }
}
