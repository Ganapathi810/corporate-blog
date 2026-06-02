type TiptapNode = {
    type: string;
    text?: string;
    content?: TiptapNode[];
}

const WORDS_PER_MINUTE = 200;

export const calculateReadTime = (content: TiptapNode): number => {
    if(!content) return 1;

    const text = extractContent(content);

    const words = text
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean)
    
    const wordCount = words.length;

    const readTime = Math.ceil(wordCount / WORDS_PER_MINUTE);

    return readTime;
}


export const extractContent = (node: TiptapNode): string => {
    if (!node) return "";

    if (node.type === "text") return node.text || "";

    if(node.type === "codeBlock") return "";

    if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractContent).join(" ");
    }

    return "";
}