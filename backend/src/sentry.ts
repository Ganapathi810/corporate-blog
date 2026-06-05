import * as Sentry from "@sentry/node";
import { env } from "./config/env.config.js";

Sentry.init({
  dsn: env.SENTRY_DSN,
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  // Enable debug mode
  // debug: true,
});