export type Post = {
    id: string;
    title: string;
    slug: string;
    content: any;
    readTime: number;
    excerpt?: string;
    createdAt: string;
    updatedAt: string;
    status?: string;
    author?: {
        name: string;
        email: string;
        image?: string;
    };
    bannerImage?: {
        url: string;
    };
    categories?: {
        category: {
            name: string;
            slug: string;
        }
    }[];
}