import { env } from "../config/env.config.js";
import { prisma } from "../database/prisma.client.js";
import { logger } from "../utils/logger.util.js";
import { generateSlug } from "../utils/slug.util.js";

export const adminBootstrap = async (): Promise<void> => {
    try {
        // 1. Check if any admin exists at all
        const anyAdmin = await prisma.user.findFirst({
            where: { role: "ADMIN" },
            select: { id: true },
        });
        
        if (anyAdmin) {
            logger.info("Admin(s) already exist. Skipping bootstrap.");
            return;
        }

        if(!env.ADMIN_EMAIL || !env.ADMIN_NAME) {
            logger.warn("ADMIN_EMAIL or ADMIN_NAME not set. Skipping bootstrap.");
            return;
        }

        // 2. Check if the specific admin email already exists as a WRITER/EDITOR
        const existingUser = await prisma.user.findUnique({
            where: { email: env.ADMIN_EMAIL }
        });

        if (existingUser) {
            await prisma.user.update({
                where: { id: existingUser.id },
                data: { role: "ADMIN" }
            });
            logger.info(`Promoted existing user ${env.ADMIN_EMAIL} to ADMIN.`);
        } else {
            // 3. Create new admin if they don't exist
            const slug = generateSlug(env.ADMIN_NAME);
            await prisma.user.create({
                data: {
                    name: env.ADMIN_NAME.replace(/['"]/g, ""), // Clean quotes if present in env
                    slug,
                    email: env.ADMIN_EMAIL,
                    role: "ADMIN",
                },
            });
            logger.info(`Created new ADMIN user: ${env.ADMIN_EMAIL}`);
        }
        
    } catch (error) {
        logger.error("Error during Admin bootstrap", { error });
    }
}