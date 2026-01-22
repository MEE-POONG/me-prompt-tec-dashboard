import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const email = "supansa.dd@rmuti.ac.th";
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.log("User not found");
    } else {
        console.log("User found:", {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
