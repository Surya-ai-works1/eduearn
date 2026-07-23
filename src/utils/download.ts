/**
 * Triggers a browser file download for a given URL.
 * @param url - File source URL or Data URL.
 * @param filename - Destination file name.
 */
export function downloadFile(url: string, filename: string): void {
  if (typeof document === "undefined") return;

  try {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error(`Error downloading file ${filename}:`, error);
  }
}

/**
 * Downloads text content as a file (e.g. log exports or mock drafts).
 * @param text - The content of the file.
 * @param filename - Destination file name.
 * @param mimeType - File mime type (default: text/plain).
 */
export function downloadText(text: string, filename: string, mimeType: string = "text/plain"): void {
  try {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    downloadFile(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    console.error(`Error downloading text file ${filename}:`, error);
  }
}
