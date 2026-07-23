/**
 * Formats a number to a short shorthand string (e.g. 10.5K, 2.3M).
 * @param num - The number to convert.
 */
export function formatNumber(num: number): string {
  if (isNaN(num)) return "0";
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

/**
 * Formats a number using localization compact mode.
 * @param num - The number to format.
 * @param locale - Locale setting (default: en-IN).
 */
export function formatCompact(num: number, locale: string = "en-IN"): string {
  try {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      compactDisplay: "short",
    }).format(num);
  } catch (error) {
    console.error("Error formatting compact number:", error);
    return formatNumber(num);
  }
}
