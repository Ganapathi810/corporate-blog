import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { PrismaClient } from '../src/generated/prisma/index.js';
import dotenv from 'dotenv';

dotenv.config();

// Configuration for Neon adapter
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
}

const adapter = new PrismaNeon({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const categories = [
    { name: '📈 Stock Market', slug: 'stock-market' },
    { name: '💳 Personal Finance', slug: 'personal-finance' },
    { name: '🪙 Digital Finance', slug: 'digital-finance' },
    { name: '🏦 Banking & Policy', slug: 'banking-policy' },
    { name: '🚀 Fintech Startups', slug: 'fintech-startups' },
    { name: '🧠 Guides', slug: 'guides' },
    { name: '📊 Market Insights', slug: 'market-insights' },
];

async function main() {
    console.log('--- Starting Category Seed (Neon Adapter) ---');
    
    for (const cat of categories) {
        const existing = await prisma.category.findUnique({
            where: { slug: cat.slug }
        });

        if (!existing) {
            await prisma.category.create({
                data: cat
            });
            console.log(`Created category: ${cat.name}`);
        } else {
            await prisma.category.update({
                where: { slug: cat.slug },
                data: { name: cat.name }
            });
            console.log(`Updated category: ${cat.name}`);
        }
    }

    console.log('--- Seed Completed ---');
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
