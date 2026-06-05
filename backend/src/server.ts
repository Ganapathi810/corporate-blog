import './sentry.js';
import 'dotenv/config';
import { createApp } from './app.js';


const app  = await createApp();


export default app;