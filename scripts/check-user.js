const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const email = "supansa.dd@rmuti.ac.th";
    const user = await prisma.user.findUnique({
        where: { email },
    });
    console.log(JSON.stringify(user, null, 2));
}

main().finally(() => prisma.$disconnect());
