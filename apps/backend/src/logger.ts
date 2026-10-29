import pino from "pino";

// Simple logger configuration - use pino-pretty in development if available
const isDevelopment = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // pino-http logs every request's headers; keep credentials out of the log drain.
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers.forwarded",
      'req.headers["x-vercel-oidc-token"]',
      'req.headers["x-vercel-proxy-signature"]',
      'req.headers["x-hydrilla-internal"]',
      'req.headers["x-api-key"]',
      'res.headers["set-cookie"]',
    ],
    censor: "[redacted]",
  },
  ...(isDevelopment
    
    
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});

