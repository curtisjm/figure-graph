import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://95673d9555b6adce5ef3767b03c39cd8@o4511180297404416.ingest.us.sentry.io/4511180298649600",

  sendDefaultPii: true,

  // 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Session Replay: 10% of all sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Structured logging via Sentry.logger.*
  enableLogs: true,

  integrations: [Sentry.replayIntegration()],
});

// Hook into App Router navigation transitions
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
