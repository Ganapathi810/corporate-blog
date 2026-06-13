import { BaseTopbar } from "./base-top-bar"
import { TopBarAuthButton } from "./topbar-auth-buttton"

export const PublicTopbar = async () => {
    return (
        <BaseTopbar showBlogLink={true}>
            <TopBarAuthButton />
        </BaseTopbar>
    )
}