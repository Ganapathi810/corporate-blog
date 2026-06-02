import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { env } from "../config/env.config.js";
import { PrismaClient } from "../generated/prisma/index.js";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
}

// Required for Neon adapter in Node.js
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });

export const prisma = 
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: ["error"],
    })

globalForPrisma.prisma = prisma;