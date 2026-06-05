import { z } from "zod";
import * as Sentry from "@sentry/node";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    PORT: z.string().optional(),
    DATABASE_URL: z.string().min(1),

    JWT_SECRET: z.string().min(1).optional(),
    ADMIN_EMAIL: z.email("Invalid email"),
    ADMIN_NAME: z.string().min(1, "Name is required"),
    GOOGLE_CLIENT_ID: z.string().min(1, "Google client id is required"),
    GOOGLE_CLIENT_SECRET: z.string().min(1, "Google client secret is required"),
    BETTER_AUTH_SECRET: z.string().min(1, "Better auth secret is required"),
    CLOUDINARY_CLOUD_NAME: z.string().min(1, "Cloudinary cloud name is required"),
    CLOUDINARY_API_KEY: z.string().min(1, "Cloudinary api key is required"),
    CLOUDINARY_API_SECRET: z.string().min(1, "Cloudinary api secret is required"),
    BETTER_AUTH_URL: z.string().min(1, "Better auth url is required").default("http://localhost:5000/api/v1/auth"),
    TRUSTED_PROXIES: z.string().min(1, "Trusted proxies is required"),
    SENTRY_DSN: z.string().min(1, "Sentry dsn is required")
})

const parsed = envSchema.safeParse(process.env)

if(!parsed.success) {
    console.error("Invalid enviromental variables");
    const formatted = z.treeifyError(parsed.error);
    Sentry.captureException(new Error("Invalid environmental variables: " + JSON.stringify(formatted, null, 2)));
    console.error(JSON.stringify(formatted, null, 2));

    process.exit(1);
}

export const env = {
    NODE_ENV: parsed.data.NODE_ENV,
    PORT: parsed.data.PORT ?? "5000",
    DATABASE_URL: parsed.data.DATABASE_URL,
    JWT_SECRET: parsed.data.JWT_SECRET,
    ADMIN_EMAIL: parsed.data.ADMIN_EMAIL,
    ADMIN_NAME: parsed.data.ADMIN_NAME,
    GOOGLE_CLIENT_ID: parsed.data.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: parsed.data.GOOGLE_CLIENT_SECRET,
    BETTER_AUTH_SECRET: parsed.data.BETTER_AUTH_SECRET,
    CLOUDINARY_CLOUD_NAME: parsed.data.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: parsed.data.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: parsed.data.CLOUDINARY_API_SECRET,
    BETTER_AUTH_URL: parsed.data.BETTER_AUTH_URL,
    TRUSTED_PROXIES: parsed.data.TRUSTED_PROXIES,
    SENTRY_DSN: parsed.data.SENTRY_DSN
}