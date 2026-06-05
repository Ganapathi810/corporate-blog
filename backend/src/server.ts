import './instrument.js';
import 'dotenv/config';
import { env } from './config/env.config.js';
import { createApp } from './app.js';
import { logger } from './utils/logger.util.js';
import { adminBootstrap } from './bootstrap/admin-bootstrap.js';



const PORT = env.PORT;

const app  = createApp();

// Ensure admin exists
await adminBootstrap();

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

export default app;