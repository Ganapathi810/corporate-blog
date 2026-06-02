/**
 * Extracts plain text from a Tiptap JSON content structure.
 * 
 * @param json The Tiptap JSON object (usually content.content)
 * @param limit Optional character limit for truncation
 * @returns Plain text representation of the content
 */
export function extractPlainTextFromTiptap(json: any, limit?: number): string {
    if (!json) return "";
    
    let text = "";
    
    function walk(node: any) {
        if (!node) return;
        
        if (node.type === "text" && node.text) {
            text += node.text;
        }
        
        // Add spaces between block-level elements to prevent words from sticking together
        const isBlock = ["paragraph", "heading", "listItem", "blockquote", "codeBlock"].includes(node.type);
        
        if (node.content && Array.isArray(node.content)) {
            for (const child of node.content) {
                walk(child);
            }
        }
        
        if (isBlock) {
            text += " ";
        }
    }

    // Tiptap top-level structure usually has a 'content' array
    if (json.content && Array.isArray(json.content)) {
        json.content.forEach(walk);
    } else if (Array.isArray(json)) {
        json.forEach(walk);
    } else {
        walk(json);
    }

    // Clean up extra spaces and trim
    const result = text.replace(/\s+/g, " ").trim();
    
    if (limit && result.length > limit) {
        return result.substring(0, limit).trim() + "...";
    }
    
    return result;
}
