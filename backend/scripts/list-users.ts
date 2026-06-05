import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { PrismaClient } from '../src/generated/prisma/index.js';
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

const adapter = new PrismaNeon({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    const users = await prisma.user.findMany();
    console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
