/**
 * Truncates a string to a specific length and appends an ellipsis.
 * @param text - The string to truncate.
 * @param length - The maximum allowed length.
 */
export function truncate(text: string, length: number): string {
  if (!text) return "";
  if (text.length <= length) return text;
  
  return text.slice(0, length).trim() + "...";
}
