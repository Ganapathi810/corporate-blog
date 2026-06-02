import { ArrowRight } from "lucide-react";

interface AffiliateCardProps {
    title: string;
    description: string;
    link: string;
    image?: string
}

export const AffiliateCard = ({
    title,
    description,
    link,
    image
}: AffiliateCardProps) => {
    return (
        <a
            href={link}
            target="_blank"
            rel="nofollow sponsored"
            className="block border rounded-xl p-4 hover:shadow-md transition"
        >
            {image && (
                <img src={image} alt={title} className="w-full h-48 object-cover rounded-lg mb-4" />
            )}

            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>

            <span className="text-blue-600 font-medium flex items-center">
                Check it out
                <ArrowRight className="inline-block ml-2" />
            </span>
        </a>
    )
}