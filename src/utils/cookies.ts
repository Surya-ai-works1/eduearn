/**
 * Sets a cookie in the browser.
 * @param name - Cookie key.
 * @param value - Cookie string value.
 * @param days - Expire duration in days.
 */
export function setCookie(name: string, value: string, days?: number): void {
  if (typeof document === "undefined") return;
  
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${encodeURIComponent(value || "")}${expires}; path=/; SameSite=Lax; Secure`;
}

/**
 * Retrieves a cookie value by key.
 * @param name - Cookie key.
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const nameEQ = `${name}=`;
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

/**
 * Deletes a cookie by key.
 * @param name - Cookie key.
 */
export function deleteCookie(name: string): void {
  setCookie(name, "", -1);
}
