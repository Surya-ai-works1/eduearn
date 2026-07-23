/**
 * Returns an inline SVG placeholder to prevent layout shifts.
 * @param width - The width of the placeholder.
 * @param height - The height of the placeholder.
 * @param text - The text to display inside the placeholder.
 */
export function getSvgPlaceholder(width: number, height: number, text: string): string {
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#E2E8F0"/>
      <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#64748B" dominant-baseline="middle" text-anchor="middle">
        ${text}
      </text>
    </svg>
  `;
  
  // Base64 encode the SVG to use as a data URL
  if (typeof window === "undefined") {
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  } else {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}

/**
 * Returns placeholder URLs for standard system images.
 */
export const placeholders = {
  course: "/assets/placeholder-course.svg",
  tutor: "/assets/placeholder-tutor.svg",
  category: "/assets/placeholder-category.svg",
  certificate: "/assets/placeholder-certificate.svg",
  ogImage: "/og-image.svg",
};
