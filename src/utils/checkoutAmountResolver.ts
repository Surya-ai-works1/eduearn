import { MOCK_COURSES } from "../constants/mockData";

/**
 * Parses and validates raw input into a positive, finite integer amount.
 * Returns null if the input is missing, invalid, NaN, infinite, or <= 0.
 */
export function parseValidAmount(input: unknown): number | null {
  if (input === null || input === undefined) return null;

  let strVal = "";
  if (typeof input === "number") {
    if (!isNaN(input) && isFinite(input) && input > 0) {
      return Math.round(input);
    }
    return null;
  }

  if (Array.isArray(input)) {
    strVal = String(input[0] || "");
  } else {
    strVal = String(input);
  }

  // Strip currency symbols and non-numeric characters except digits and decimal point
  const sanitized = strVal.replace(/[^0-9.]/g, "").trim();
  if (!sanitized) return null;

  const num = Number(sanitized);
  if (!isNaN(num) && isFinite(num) && num > 0) {
    return Math.round(num);
  }

  return null;
}

/**
 * Deterministically resolves the checkout base price between server and client.
 * Priority order:
 * 1. Valid numeric amount passed via URL query parameter
 * 2. Valid course price from MOCK_COURSES for the given courseId
 * 3. Legitimate default fallback amount (900)
 */
export function resolveCheckoutAmount(
  amountProp: number | null | undefined,
  courseId: string | null | undefined,
  fallbackDefault = 900
): number {
  const validAmount = parseValidAmount(amountProp);
  if (validAmount !== null) {
    return validAmount;
  }

  if (courseId) {
    const matchedCourse = MOCK_COURSES.find((c) => c.id === courseId);
    if (matchedCourse) {
      const validCoursePrice = parseValidAmount(matchedCourse.price);
      if (validCoursePrice !== null) {
        return validCoursePrice;
      }
    }
  }

  return fallbackDefault;
}
