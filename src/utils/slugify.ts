/**
 * Converts a string into a URL-friendly slug.
 * @param text - The string to slugify.
 */
export function slugify(text: string): string {
  if (!text) return "";
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")           // Replace spaces with -
    .replace(/[^\w\-]+/g, "")       // Remove all non-word chars except dashes
    .replace(/\-\-+/g, "-")         // Replace multiple dashes with single dash
    .replace(/^-+/, "")             // Trim dashes from start
    .replace(/-+$/, "");            // Trim dashes from end
}
