export function generateSlug(input: string): string {
    return input
        .toLowerCase()
        .trim()
        // replace any sequence of non-alphanumeric characters with a hyphen
        .replace(/[^a-z0-9]+/g, "-")
        // remove leading/trailing hyphens
        .replace(/^-+|-+$/g, "");
}

