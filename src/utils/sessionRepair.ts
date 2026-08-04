/**
 * Session Repair Utility for development environment.
 * Audits local storage/session storage, detects corrupted, mismatch, or stale session
 * and role values, and repairs them automatically to synchronize internal systems.
 */

import { normalizeRole } from "./rbacResolver";

export function repairSessionInDev(): void {
  if (typeof window === "undefined") return;

  const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_MODE === "true";
  if (!isDev) return;

  let sessionObj: any = null;
  const storedSession = localStorage.getItem("eduearn_session");
  const storedMock = localStorage.getItem("eduearn_mock_session");
  const storedRole = localStorage.getItem("eduearn_role");
  const storedUser = localStorage.getItem("eduearn_user");
  const storedCurrentUser = localStorage.getItem("eduearn_current_user");

  // Step 1: Detect session object from any possible source, giving priority to eduearn_session
  if (storedSession) {
    try {
      sessionObj = JSON.parse(storedSession);
    } catch {
      console.warn("[Session Repair] Corrupted eduearn_session JSON detected.");
    }
  }

  if ((!sessionObj || !sessionObj.user) && storedMock) {
    try {
      sessionObj = JSON.parse(storedMock);
    } catch {}
  }

  if ((!sessionObj || !sessionObj.user) && storedCurrentUser) {
    try {
      const parsedUser = JSON.parse(storedCurrentUser);
      if (parsedUser) {
        sessionObj = { user: parsedUser, isAuthenticated: true };
      }
    } catch {}
  }

  if ((!sessionObj || !sessionObj.user) && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser) {
        sessionObj = { user: parsedUser, isAuthenticated: true };
      }
    } catch {}
  }

  // Step 2: If we still don't have a valid session, let's create a default student session
  if (!sessionObj || !sessionObj.user) {
    sessionObj = {
      user: {
        id: "dev-student-id",
        email: "student@eduearn.com",
        fullName: "Student Demo",
        role: "student",
        complete: true
      },
      isAuthenticated: true
    };
  }

  // Step 3: Normalize the role name
  const rawRole = sessionObj.user.role || storedRole || "student";
  const canonicalRole = normalizeRole(rawRole);
  sessionObj.user.role = canonicalRole;

  // Step 4: Repair storage - make eduearn_session the single authoritative source of truth
  localStorage.setItem("eduearn_session", JSON.stringify(sessionObj));
  localStorage.setItem("eduearn_last_repair_time", new Date().toLocaleString());

  // Step 5: Mirror to cookies for middleware compatibility (Phase 2 & 5)
  if (typeof document !== "undefined") {
    const userJson = encodeURIComponent(JSON.stringify(sessionObj.user));
    document.cookie = `eduearn-bypass-session=1; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `eduearn_dev_role=${canonicalRole}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `eduearn_dev_user=${userJson}; path=/; max-age=86400; SameSite=Lax`;
  }

  // Step 6: Clean up all duplicate and redundant role/session keys in both local and session storage
  const redundantKeys = [
    "eduearn_mock_session",
    "eduearn_role",
    "eduearn_current_user",
    "eduearn_dev_mode",
    "eduearn_user",
    "eduearn_profile",
    "eduearn_permissions",
    "eduearn_rbac",
    "eduearn_admin"
  ];

  redundantKeys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  console.log("[Session Repair] Session and role values normalized successfully to:", canonicalRole);
}
