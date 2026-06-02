import type { Application } from 'express';
import express from 'express';
import helmet from 'helmet';
import { requestId } from './middlewares/request-id.middleware.js';
import { apiRouter } from './routes.js';
import { globalErrorHandler, notFoundHandler } from './middlewares/error-handler.middleware.js';
import cors from 'cors'
import { toNodeHandler } from "better-auth/node"
import { auth } from './config/auth.config.js';
import { logger } from './utils/logger.util.js';
import  * as Sentry from '@sentry/node';
import { env } from './config/env.config.js';

export function createApp(): Application {
    const app = express();
    
    app.use(helmet());
    
    // origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    app.use(cors({
        origin: [...env.TRUSTED_PROXIES.split(",")],
        credentials: true,
        optionsSuccessStatus: 200
    }))
    
    // Debug logger for auth integration
    app.use((req, res, next) => {
        if (req.url.startsWith('/api/v1/auth')) {
            logger.info(`[Auth Request]: ${req.method} ${req.url} from ${req.headers.origin || 'unknown origin'}`)
        }
        next()
    })
    
    app.all('/api/v1/auth/*path', toNodeHandler(auth))

    app.use(express.json({ limit: '1mb' }));


    app.use(requestId);


    app.use('/api/v1', apiRouter)

    Sentry.setupExpressErrorHandler(app);

    app.use(notFoundHandler);
    app.use(globalErrorHandler)
    

    return app;
}
