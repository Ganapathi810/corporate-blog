/**
 * Schema.org JSON-LD component.
 * Renders structured data as a <script type="application/ld+json"> tag.
 * Use in any Server Component page to inject schema markup.
 */
interface SchemaOrgProps {
    schema: Record<string, unknown> | Record<string, unknown>[];
}

export function SchemaOrg({ schema }: SchemaOrgProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
