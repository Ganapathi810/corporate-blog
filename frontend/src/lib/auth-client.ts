import { createAuthClient } from "better-auth/react";

import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
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
})

export const { useSession } = authClient;

export const signIn = async () => {
    await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/dashboard"
    })
}

export const signOut = async () => {
    await authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                window.location.href = "/login"
            }
        }
    })
}
