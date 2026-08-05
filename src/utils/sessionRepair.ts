/**
 * Session Cleanup Utility for development environment.
 * Purges all legacy mock/dev session storage keys and cookies to ensure
 * strictly real Supabase authentication state is maintained.
 */

export function repairSessionInDev(): void {
  if (typeof window === "undefined") return;

  const redundantKeys = [
    "eduearn_session",
    "eduearn_mock_session",
    "eduearn_role",
    "eduearn_current_user",
    "eduearn_dev_mode",
    "eduearn_user",
    "eduearn_mock_user",
    "eduearn_profile",
    "eduearn_permissions",
    "eduearn_rbac",
    "eduearn_admin",
    "eduearn_last_repair_time"
  ];

  redundantKeys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  if (typeof document !== "undefined") {
    document.cookie = `eduearn-bypass-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    document.cookie = `eduearn_dev_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    document.cookie = `eduearn_dev_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}
