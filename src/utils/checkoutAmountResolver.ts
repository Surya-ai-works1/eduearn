import { createAdminClient } from "@/lib/supabase/admin";

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
 * Server-Authoritative Database Course Price Resolver.
 * Resolves official selling_price / price directly from Supabase courses table.
 * Never accepts client-provided URL params or MOCK_COURSES fallbacks for price authority.
 */
export async function getAuthoritativeCoursePrice(
  courseId: string | null | undefined
): Promise<number | null> {
  if (!courseId) return null;
  try {
    const admin = createAdminClient();
    const { data: dbCourse } = await admin
      .from("courses")
      .select("price, selling_price")
      .eq("id", courseId)
      .maybeSingle();

    if (!dbCourse) return null;

    const priceNum = Number(dbCourse.selling_price ?? dbCourse.price ?? 0);
    return parseValidAmount(priceNum);
  } catch (err) {
    console.error("Failed to resolve authoritative course price from database:", err);
    return null;
  }
}

/**
 * Safe fallback price resolver for UI display.
 * Ignores untrusted client URL query parameters and MOCK_COURSES.
 * Final price enforcement is strictly performed server-side in create-order and verify-payment APIs.
 */
export function resolveCheckoutAmount(
  _ignoredAmountProp: unknown,
  _courseId: string | null | undefined,
  fallbackDefault = 0
): number {
  return fallbackDefault;
}
