import winston from "winston";
import { env } from "../config/env.config.js";

const isDev = env.NODE_ENV !== "production";

// * Example output:
//  *   2024-01-15 10:23:45 [WARN] Operational error  { code: 'NOT_FOUND', statusCode: 404 }

const devFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? `
${JSON.stringify(meta, null, 2)}` : "";
        return `${timestamp} ${level}: ${message}${metaStr}`;
    })
)

const prodFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
    winston.format.errors({ stack: true }),
    winston.format.json()
)

const transports: winston.transport[] = [
    new winston.transports.Console()
]

const winstonLogger = winston.createLogger({
    level: isDev ? "debug" : "info",
    format: isDev ? devFormat : prodFormat,
    transports,

    exitOnError: false
})


type LogMeta = Record<string, unknown>;

export const logger = {
    info: (message: string, meta?: LogMeta) => winstonLogger.info(message, meta),
    warn: (message: string, meta?: LogMeta) => winstonLogger.warn(message, meta),
    error: (message: string, meta?: LogMeta) => winstonLogger.error(message, meta),
    debug: (message: string, meta?: LogMeta) => winstonLogger.debug(message, meta),

    instance: winstonLogger
}


