/**
 * EduEarn Centralized Structured Logger
 * Enforces production safety, security sanitization, and configurable verbosity.
 */

export interface LogContext {
  requestId?: string;
  route?: string;
  method?: string;
  userId?: string;
  role?: string;
  executionTimeMs?: number;
  dbTable?: string;
  dbOperation?: string;
  rowsAffected?: number;
  responseStatus?: number;
  success?: boolean;
  failure?: boolean;
  errorMessage?: string;
  stack?: string;
  payload?: any;
}

const SENSITIVE_KEYS = [
  "password",
  "token",
  "otp",
  "accesstoken",
  "refreshtoken",
  "jwt",
  "secret",
  "key",
  "credential"
];

/**
 * Sanitizes sensitive fields from any payload or object recursively.
 */
export function sanitizePayload(data: any): any {
  if (!data) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(sanitizePayload);
  }

  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = "[REDACTED_SENSITIVE_DATA]";
    } else if (typeof data[key] === "object") {
      sanitized[key] = sanitizePayload(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
}

/**
 * Logger class with environment-aware verbosity level filtering.
 */
class Logger {
  private isProduction = process.env.NODE_ENV === "production";
  private isVerbose = process.env.VERBOSE_LOGGING === "true" || !this.isProduction;

  private formatMessage(level: "INFO" | "WARN" | "ERROR" | "CRITICAL" | "AUDIT", message: string, ctx?: LogContext) {
    const timestamp = new Date().toISOString();
    const reqId = ctx?.requestId || Math.random().toString(36).substring(2, 11).toUpperCase();
    
    // Sanitize user inputs/payloads in context
    const cleanPayload = ctx?.payload ? sanitizePayload(ctx.payload) : undefined;
    const cleanStack = !this.isProduction && ctx?.stack ? ctx.stack : undefined;

    return {
      timestamp,
      level,
      requestId: reqId,
      message,
      route: ctx?.route,
      method: ctx?.method,
      userId: ctx?.userId,
      role: ctx?.role,
      executionTimeMs: ctx?.executionTimeMs,
      dbTable: ctx?.dbTable,
      dbOperation: ctx?.dbOperation,
      rowsAffected: ctx?.rowsAffected,
      responseStatus: ctx?.responseStatus,
      success: ctx?.success ?? (ctx?.failure ? false : undefined),
      failure: ctx?.failure ?? (ctx?.errorMessage ? true : undefined),
      errorMessage: ctx?.errorMessage,
      stack: cleanStack,
      payload: cleanPayload,
    };
  }

  /**
   * Logs a standard debug info trace. Silenced in production.
   */
  info(message: string, ctx?: LogContext) {
    if (!this.isVerbose) return;
    const logObj = this.formatMessage("INFO", message, ctx);
    console.log(JSON.stringify(logObj));
  }

  /**
   * Logs a warning issue. Always logged in both dev and prod.
   */
  warn(message: string, ctx?: LogContext) {
    const logObj = this.formatMessage("WARN", message, ctx);
    console.warn(JSON.stringify(logObj));
  }

  /**
   * Logs an execution failure error. Always logged.
   */
  error(message: string, ctx?: LogContext) {
    const logObj = this.formatMessage("ERROR", message, ctx);
    console.error(JSON.stringify(logObj));
  }

  /**
   * Logs critical system-wide alert faults.
   */
  critical(message: string, ctx?: LogContext) {
    const logObj = this.formatMessage("CRITICAL", message, ctx);
    console.error(JSON.stringify(logObj));
  }

  /**
   * Logs a security or workflow compliance event (e.g. settings updates, coupon creations).
   */
  audit(message: string, ctx?: LogContext) {
    const logObj = this.formatMessage("AUDIT", message, ctx);
    console.log(JSON.stringify(logObj));
  }
}

export const logger = new Logger();
export default logger;
