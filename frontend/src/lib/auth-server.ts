import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { headers } from "next/headers";

/**
 * Server-side auth client for use in Server Components, Layouts, and Route Handlers.
 * Unlike auth-client.ts (which uses "better-auth/react" and is meant for Client Components),
 * this uses the vanilla "better-auth/client" which has no React dependency.
 */
const authServerClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
    plugins: [
        inferAdditionalFields({
            user: {
                role: {
                    type: "string",
                },
                slug: {
                    type: "string",
                },
            }
        })
    ]
});

/**
 * Get the current session on the server side.
 * Automatically forwards request headers (including cookies) to the auth backend.
 *
 * Usage in Server Components / Layouts:
 * ```ts
 * const session = await getServerSession();
 * ```
 */
export async function getServerSession() {
    const result = await authServerClient.getSession({
        fetchOptions: {
            headers: await headers(),
        }
    });
    return result;
}
