import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "./env.config.js";
import { prisma } from "../database/prisma.client.js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    
    // Crucial for routing in Express
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    
    session: {
        strategy: "jwt",
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 24 hours (refresh token if older than 24h)
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes
        }
    },

    
    advanced: {
       crossSubDomainCookies: {
            enabled: true,
            domain: "corporateblog.in", // The root domain shared by your frontend and backend
        },
        // Force secure cookies in production environments
        useSecureCookies: process.env.NODE_ENV === "production"
    },
    

    trustedOrigins: env.TRUSTED_PROXIES?.split(","),
    
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
        }
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "WRITER"
            },
            slug: {
                type: "string",
                required: false
            }
        }
    },

    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    // Import the slug utility inline or at the top
                    const { generateSlug } = await import("../utils/slug.util.js");
                    let baseSlug = generateSlug(user.name);
                    let finalSlug = baseSlug;
                    let counter = 1;
                    
                    while (await prisma.user.findUnique({ where: { slug: finalSlug } })) {
                        finalSlug = `${baseSlug}-${counter}`;
                        counter++;
                    }
                    
                    return {
                        data: {
                            ...user,
                            slug: finalSlug
                        }
                    }
                }
            }
        }
    }
})