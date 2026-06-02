import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://539bb053f1354e678e9527ce43c6ea65@o4511250701090816.ingest.us.sentry.io/4511257231884288",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  // Enable debug mode
  debug: true,
});