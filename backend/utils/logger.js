import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const writeLog = (category, level, message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${category.toUpperCase()}] [${level.toUpperCase()}] ${message}\n`;
  
  // Console logging
  if (level === "error") {
    console.error(logMessage.trim());
  } else if (level === "warn") {
    console.warn(logMessage.trim());
  } else {
    console.log(logMessage.trim());
  }

  // File logging
  const logFile = path.join(logDir, `${category}.log`);
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) console.error("Logger append failed:", err);
  });
};

const logger = {
  info: (category, message) => writeLog(category, "info", message),
  warn: (category, message) => writeLog(category, "warn", message),
  error: (category, message) => writeLog(category, "error", message),
  security: (message) => writeLog("security", "warn", message),
  ai: (message) => writeLog("ai", "info", message),
  payment: (message) => writeLog("payment", "info", message),
  auth: (message) => writeLog("auth", "info", message)
};

export default logger;
