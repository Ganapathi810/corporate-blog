import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing connection...');
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Connection successful:', result);
}

main()
    .catch((e) => {
        console.error('Connection failed:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
