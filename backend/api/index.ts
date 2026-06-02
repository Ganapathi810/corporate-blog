import '../src/instrument.js';
import 'dotenv/config';
import { createApp } from '../src/app.js';
import { adminBootstrap } from '../src/bootstrap/admin-bootstrap.js';
import { logger } from '../src/utils/logger.util.js';

const app = createApp();

// Start bootstrap in background. On Vercel this happens during cold start.
adminBootstrap()
  .then(() => logger.info('[Vercel] Admin bootstrap completed'))
  .catch((err) => logger.error('[Vercel] Admin bootstrap failed', err));

export default app;
