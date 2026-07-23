/**
 * EduEarn Monitoring and Logging Library
 * Centralizes placeholders for Sentry, PostHog, and Google Analytics.
 */

// Sentry Error Logger Placeholder
export function logErrorToSentry(error: Error, extraInfo?: Record<string, unknown>) {
  console.warn("[MONITORING] Sentry Alert Caught Error:", error.message);
  if (extraInfo) {
    console.warn("[MONITORING] Extra Context:", JSON.stringify(extraInfo));
  }
  // If Sentry is installed later, import it and do:
  // Sentry.captureException(error, { extra: extraInfo });
}

// PostHog Event Tracker Placeholder
export function trackEventPostHog(eventName: string, properties?: Record<string, unknown>) {
  console.info(`[MONITORING] PostHog Event: "${eventName}"`, properties);
  // If PostHog is installed later, do:
  // posthog.capture(eventName, properties);
}

// Google Analytics PageView Tracker Placeholder
export function trackGoogleAnalyticsPageView(url: string) {
  console.info(`[MONITORING] Google Analytics PageView tracked: ${url}`);
  // If Google Analytics is configured, do:
  // window.gtag('config', 'GA_MEASUREMENT_ID', { page_path: url });
}

// Custom Auditing logs (for actions like wallet withdrawals, coupon creations, etc.)
export function auditLog(action: string, actor: string, details: string) {
  const timestamp = new Date().toISOString();
  console.info(`[AUDIT LOG] [${timestamp}] Actor: ${actor} | Action: ${action} | Details: ${details}`);
}
