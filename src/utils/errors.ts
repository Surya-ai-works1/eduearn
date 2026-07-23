/**
 * Safely normalizes any error object (Error, AuthApiError, PostgrestError, Fetch error, or unknown)
 * into a human-readable string. This prevents empty "{}" render bugs when Error instances
 * are passed directly to notifications.
 */
export function normalizeError(error: unknown): string {
  if (!error) {
    return "An unknown error occurred.";
  }

  // 1. If it's already a string
  if (typeof error === "string") {
    return error;
  }

  // 2. If it's an instance of Error
  if (error instanceof Error) {
    return error.message;
  }

  // 3. If it is an object
  if (typeof error === "object") {
    const errObj = error as Record<string, unknown>;

    // Supabase Auth / general error message check
    if (typeof errObj.message === "string" && errObj.message.trim() !== "") {
      return errObj.message;
    }

    // OAuth / Auth description check
    if (typeof errObj.error_description === "string" && errObj.error_description.trim() !== "") {
      return errObj.error_description;
    }

    // Standard nested error string property check
    if (typeof errObj.error === "string" && errObj.error.trim() !== "") {
      return errObj.error;
    }

    // Nested error object check (e.g. error: { message: "..." })
    if (errObj.error && typeof errObj.error === "object") {
      const nestedErr = errObj.error as Record<string, unknown>;
      if (typeof nestedErr.message === "string" && nestedErr.message.trim() !== "") {
        return nestedErr.message;
      }
    }

    // PostgrestError checks
    if (typeof errObj.details === "string" && errObj.details.trim() !== "") {
      return `${errObj.message || "Database error"}: ${errObj.details}`;
    }

    // Avoid returning "{}"
    try {
      const str = JSON.stringify(errObj);
      if (str && str !== "{}" && str.trim() !== "") {
        return str;
      }
    } catch {
      // Ignore stringify error
    }
  }

  // Fallback string conversion
  const fallbackStr = String(error);
  if (fallbackStr === "[object Object]" || fallbackStr === "{}") {
    return "An unexpected error occurred.";
  }
  return fallbackStr || "An unknown error occurred.";
}
