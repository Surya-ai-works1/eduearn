/**
 * Safely normalizes any error object (Error, AuthApiError, PostgrestError, Fetch error, or unknown)
 * into a human-readable string. This prevents empty "{}" render bugs when Error instances
 * are passed directly to notifications.
 */
export function normalizeError(error: unknown): string {
  if (!error) {
    return "An unknown error occurred.";
  }

  let rawMessage = "";

  // 1. If it's already a string
  if (typeof error === "string") {
    rawMessage = error;
  } else if (error instanceof Error) {
    // 2. If it's an instance of Error
    rawMessage = error.message;
  } else if (typeof error === "object") {
    // 3. If it is an object
    const errObj = error as Record<string, unknown>;

    if (typeof errObj.message === "string" && errObj.message.trim() !== "") {
      rawMessage = errObj.message;
    } else if (typeof errObj.error_description === "string" && errObj.error_description.trim() !== "") {
      rawMessage = errObj.error_description;
    } else if (typeof errObj.error === "string" && errObj.error.trim() !== "") {
      rawMessage = errObj.error;
    } else if (errObj.error && typeof errObj.error === "object") {
      const nestedErr = errObj.error as Record<string, unknown>;
      if (typeof nestedErr.message === "string" && nestedErr.message.trim() !== "") {
        rawMessage = nestedErr.message;
      }
    } else if (typeof errObj.details === "string" && errObj.details.trim() !== "") {
      rawMessage = `${errObj.message || "Database error"}: ${errObj.details}`;
    } else {
      try {
        const str = JSON.stringify(errObj);
        if (str && str !== "{}" && str.trim() !== "") {
          rawMessage = str;
        }
      } catch {
        // Ignore stringify error
      }
    }
  }

  if (!rawMessage) {
    const fallbackStr = String(error);
    if (fallbackStr === "[object Object]" || fallbackStr === "{}" || !fallbackStr) {
      return "We encountered a temporary issue processing your request. Please try again in a moment.";
    }
    rawMessage = fallbackStr;
  }

  const lowerMsg = rawMessage.toLowerCase();

  // Sanitize raw network / fetch errors
  if (
    lowerMsg.includes("fetch failed") ||
    lowerMsg.includes("failed to fetch") ||
    lowerMsg.includes("networkerror") ||
    lowerMsg.includes("network error") ||
    lowerMsg.includes("econnrefused") ||
    lowerMsg.includes("load failed") ||
    lowerMsg.includes("failed to execute 'fetch'")
  ) {
    return "We couldn't connect to the server right now. Please check your connection and try again.";
  }

  // Sanitize raw JS runtime / TypeError / internal server errors
  if (
    lowerMsg.includes("cannot read properties") ||
    lowerMsg.includes("typeerror") ||
    lowerMsg.includes("referenceerror") ||
    lowerMsg.includes("500 internal server error") ||
    lowerMsg.includes("internal server error") ||
    lowerMsg.includes("unexpected token") ||
    lowerMsg.includes("syntaxerror")
  ) {
    return "We encountered a temporary issue processing your request. Please try again in a moment.";
  }

  return rawMessage;
}
