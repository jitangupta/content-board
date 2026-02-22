import * as Sentry from '@sentry/react';

export const SentryErrorBoundary = Sentry.ErrorBoundary;

export function initSentry(): void {
  Sentry.init({
    dsn: 'https://59514916cb8841480f3605d6a10297f1@o4510924067045376.ingest.us.sentry.io/4510924073533440',
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD,
    tracesSampleRate: 0,
    beforeSend(event) {
      return event;
    },
  });
}

export function captureError(
  error: unknown,
  context?: Record<string, string>,
): void {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, string>,
): void {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}

export function setUserContext(email: string): void {
  Sentry.setUser({ email });
}

export function clearUserContext(): void {
  Sentry.setUser(null);
}
