import crypto from 'crypto';

/**
 * Generates a SHA-256 hash from a string.
 */
export function generateHash(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Generates a unique daily view hash for IP + UA.
 */
export function generateViewHash(ip: string, ua: string): string {
    return generateHash(`${ip}-${ua}`);
}

/**
 * Returns the current date as a YYYY-MM-DD string.
 */
export function getDayString(): string {
    return new Date().toISOString().split('T')[0] ?? '';
}
