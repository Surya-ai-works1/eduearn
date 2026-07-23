/**
 * Formats a number as a currency string.
 * @param amount - The numeric amount to format.
 * @param currency - The currency code (default: INR).
 * @param locale - The locale string (default: en-IN).
 */
export function formatCurrency(
  amount: number,
  currency: string = "INR",
  locale: string = "en-IN"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return `${currency} ${amount}`;
  }
}
