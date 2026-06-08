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
    // const result = await authServerClient.getSession({
    //     fetchOptions: {
    //         headers: await headers(),
    //     }
    // });
    // return result;
    const h = await headers();

    console.log("COOKIE HEADER:");
    console.log(h.get("cookie"));

    const result = await authServerClient.getSession({
        fetchOptions: {
            headers: h,
        }
    });

    console.log("AUTH RESULT:");
    console.log(JSON.stringify(result, null, 2));

    return result;
}

// export async function getServerSession() {
//     const h = await headers();

//     const response = await fetch(
//         `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/get-session`,
//         {
//             headers: {
//                 cookie: h.get("cookie") ?? "",
//             },
//             cache: "no-store",
//         }
//     );

//     const data = await response.json();

//     console.log("MANUAL FETCH RESULT:");
//     console.log(JSON.stringify(data, null, 2));

//     return data;
// }
