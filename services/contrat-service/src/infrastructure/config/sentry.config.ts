import * as Sentry from '@sentry/node';

// Define our own interface since @nestjs/sentry doesn't exist
export interface SentryModuleOptions {
  dsn: string;
  debug?: boolean;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
  integrations?: any[];
  logLevels?: string[];
}

export const sentryConfig: SentryModuleOptions = {
  dsn: process.env.SENTRY_DSN || '',
  debug: process.env.NODE_ENV !== 'production',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.npm_package_version || '0.0.0',
  tracesSampleRate: 1.0, // Capture 100% des transactions en dev, ajustez pour la production
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express(),
  ],
  logLevels: ['error', 'warn'],
};
