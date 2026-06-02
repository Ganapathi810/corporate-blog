import { SignupWithGoogleButton } from "@/components/signup-with-google-button";
import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Login() {
    const { data: session } = await authClient.getSession({
        fetchOptions: {
            headers: await headers(),
        }
    })

    if (session) {
        redirect("/dashboard")
    }

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#525CEB]">
            <div className="flex flex-col items-center gap-y-10">
                <div className="flex items-center gap-2">
                    <Image
                        src={'/favicon.ico'}
                        height={32}
                        width={32}
                        alt="logo"
                    />
                    <span className="text-2xl text-white font-semibold">Corporate blog</span>
                </div>
                <div className="flex flex-col items-center gap-4 px-2">
                    <div className="flex flex-col items-center gap-0.5 w-full">
                        <p className="text-4xl text-blue-100 text-center">Sign in with Google</p>
                        <p className="text-md text-blue-200 text-center ">Sign in with your Google account to access the app.</p>
                    </div>
                    <SignupWithGoogleButton /> 
                </div>
            </div>
        </div>
    )
}