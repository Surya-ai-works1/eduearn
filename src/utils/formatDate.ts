/**
 * Formats a date into a localized readable string.
 * @param date - Date object, ISO string, or timestamp.
 * @param options - Optional formatting configurations.
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    
    return d.toLocaleDateString("en-IN", options || {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(date);
  }
}

/**
 * Returns a relative time string (e.g. "3 hours ago", "just now").
 * @param date - Past date object, ISO string, or timestamp.
 */
export function formatRelativeTime(date: Date | string | number): string {
  try {
    const d = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 10) return "just now";
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;

    return formatDate(d);
  } catch (error) {
    console.error("Error calculating relative time:", error);
    return "";
  }
}
