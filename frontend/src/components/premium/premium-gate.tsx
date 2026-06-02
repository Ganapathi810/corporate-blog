interface PremiumGateProps {
    children: React.ReactNode;
    isPremium: boolean;
}

export const PremiumGate = ({ isPremium, children }: PremiumGateProps) => {
    if (!isPremium) {
        return <>{children}</>
    }
    return (
        <div className="border rounded-xl p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">
                Premium Content
            </h2>
            <p className="text-gray-600 mb-4">
                subscribe to view this post.
            </p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                Upgrade to Premium
            </button>
        </div>
    )
}