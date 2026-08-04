/**
 * Enterprise Central Logging Framework
 * Pretty formatted console outputs in Development mode.
 * Structured JSON logs in Production environments.
 */

type LogLevel = "INFO" | "WARN" | "ERROR" | "SECURITY" | "AUDIT" | "PERFORMANCE";

class EnterpriseLogger {
  private isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_MODE === "true";

  private formatMessage(level: LogLevel, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    
    if (!this.isDev) {
      // Production Structured JSON Log format (Phase 3)
      return JSON.stringify({
        timestamp,
        level,
        message,
        context: context || {}
      });
    }

    // Development pretty console string formatting
    const contextStr = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : "";
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  private write(level: LogLevel, message: string, context?: any) {
    const formatted = this.formatMessage(level, message, context);

    switch (level) {
      case "INFO":
      case "AUDIT":
        console.log(formatted);
        break;
      case "WARN":
      case "PERFORMANCE":
        console.warn(formatted);
        break;
      case "ERROR":
      case "SECURITY":
        console.error(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  public info(message: string, context?: any) {
    this.write("INFO", message, context);
  }

  public warn(message: string, context?: any) {
    this.write("WARN", message, context);
  }

  public error(message: string, context?: any) {
    this.write("ERROR", message, context);
  }

  public security(message: string, context?: any) {
    this.write("SECURITY", message, context);
  }

  public audit(message: string, context?: any) {
    this.write("AUDIT", message, context);
  }

  public performance(message: string, context?: any) {
    this.write("PERFORMANCE", message, context);
  }
}

export const logger = new EnterpriseLogger();
export default logger;
