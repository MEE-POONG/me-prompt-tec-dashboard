// Script to update all "Admin" roles to "Owner" in WorkspaceMember collection
// Run this script once to migrate existing data

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateAdminToOwner() {
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

        // Show updated members
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

        console.log('\n📋 Updated members:');
        updatedMembers.forEach(member => {
            console.log(`  - ${member.name} (${member.role}) in board: ${member.board?.name || 'N/A'}`);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateAdminToOwner();
