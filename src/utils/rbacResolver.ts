/**
 * Enterprise RBAC Permission Resolver
 * Centralized authorization rules engine for EduEarn.
 * Mapped canonical roles: "student" | "tutor" | "admin" | "super-admin" | "finance" | "moderator" | "support"
 */

export type CanonicalRole = "student" | "tutor" | "admin" | "super-admin" | "finance" | "moderator" | "support";

export const PRIMARY_ADMIN_EMAIL = process.env.PRIMARY_ADMIN_EMAIL || "suryasaiteja2005@gmail.com";

export function isPrimaryAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL.toLowerCase().trim();
}

export function normalizeRole(rawRole: any): CanonicalRole {
  if (!rawRole) return "student";
  const normalized = String(rawRole).trim().toLowerCase();
  
  if (normalized === "admin" || normalized === "administrator" || normalized === "admins") {
    return "admin";
  }
  if (normalized === "superadmin" || normalized === "super-admin") {
    return "super-admin";
  }
  if (normalized === "tutor" || normalized === "educator" || normalized === "teacher") {
    return "tutor";
  }
  if (normalized === "student" || normalized === "learner") {
    return "student";
  }
  if (normalized === "finance" || normalized === "billing") {
    return "finance";
  }
  if (normalized === "moderator" || normalized === "mod" || normalized === "content reviewer" || normalized === "reviewer") {
    return "moderator";
  }
  if (normalized === "support" || normalized === "helpdesk" || normalized === "support staff") {
    return "support";
  }
  
  return "student"; // default fallback
}

export function getPermissionsCountForRole(role: CanonicalRole): number {
  switch (role) {
    case "super-admin":
      return 64; // Full system access
    case "admin":
      return 48; // Operational admin access
    case "finance":
      return 24; // Revenue, reports, and payments
    case "moderator":
      return 18; // Content verifications and courses approval
    case "support":
      return 12; // Communications and support logs
    case "tutor":
      return 16; // Course catalog creation and assignments evaluation
    case "student":
      return 8;  // Market access, learning panel, assignments submission
    default:
      return 0;
  }
}

export interface RouteDecision {
  allowed: boolean;
  redirectPath?: string;
  reason: string;
}

export function resolveRouteDecision(
  role: string | null | undefined,
  pathname: string,
  complete: boolean
): RouteDecision {
  const normRole = normalizeRole(role);

  // 1. Bypass public static assets, api endpoints, and system fallback paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/forbidden" ||
    pathname === "/unauthorized" ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return { allowed: true, reason: "Public resource or API endpoint bypass" };
  }

  // 2. Classify path rules
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/tutor/login") ||
    pathname.startsWith("/tutor/register") ||
    pathname.startsWith("/student/login") ||
    pathname.startsWith("/student/register");

  const isProtectedPage =
    pathname.startsWith("/complete-profile") ||
    pathname.startsWith("/choose-role") ||
    pathname.startsWith("/welcome") ||
    (pathname.startsWith("/tutor") &&
      !pathname.startsWith("/tutor/login") &&
      !pathname.startsWith("/tutor/register")) ||
    (pathname.startsWith("/student") &&
      !pathname.startsWith("/student/login") &&
      !pathname.startsWith("/student/register")) ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/learn") ||
    pathname.startsWith("/dashboard");

  // 3. User is NOT logged in
  if (!role) {
    if (isProtectedPage) {
      if (pathname.startsWith("/tutor")) {
        return { allowed: false, redirectPath: "/tutor/login", reason: "Unauthenticated tutor path request" };
      }
      return { allowed: false, redirectPath: "/login", reason: "Unauthenticated general path request" };
    }
    return { allowed: true, reason: "Unauthenticated access allowed for public pages" };
  }

  // 4. User is logged in and tries to access guest auth pages
  if (isAuthPage) {
    if (!complete) {
      if (normRole === "tutor") {
        return { allowed: false, redirectPath: "/tutor/onboarding", reason: "Logged in but incomplete tutor onboarding" };
      }
      return { allowed: false, redirectPath: "/complete-profile", reason: "Logged in but incomplete student onboarding" };
    }
    // Completed, redirect to dashboard
    if (normRole === "admin" || normRole === "super-admin") {
      return { allowed: false, redirectPath: "/admin/dashboard", reason: "Authenticated admin guest page bypass" };
    }
    if (normRole === "tutor") {
      return { allowed: false, redirectPath: "/tutor/dashboard", reason: "Authenticated tutor guest page bypass" };
    }
    return { allowed: false, redirectPath: "/learn", reason: "Authenticated student guest page bypass" };
  }

  // 5. User is logged in and onboarding is incomplete
  if (isProtectedPage) {
    if (!complete) {
      if (normRole === "tutor") {
        if (pathname !== "/tutor/onboarding") {
          return { allowed: false, redirectPath: "/tutor/onboarding", reason: "Force redirect to tutor onboarding" };
        }
      } else {
        if (pathname !== "/complete-profile" && pathname !== "/choose-role") {
          return { allowed: false, redirectPath: "/complete-profile", reason: "Force redirect to student profile completion" };
        }
      }
    } else {
      // Completed onboarding, redirect away from onboarding pages
      if (pathname === "/choose-role" || pathname === "/complete-profile" || pathname === "/tutor/onboarding") {
        if (normRole === "admin" || normRole === "super-admin") {
          return { allowed: false, redirectPath: "/admin/dashboard", reason: "Completed admin onboarding page escape" };
        }
        if (normRole === "tutor") {
          return { allowed: false, redirectPath: "/tutor/dashboard", reason: "Completed tutor onboarding page escape" };
        }
        return { allowed: false, redirectPath: "/learn", reason: "Completed student onboarding page escape" };
      }
    }
  }

  // 6. Role-based directory authorization checks
  if (isProtectedPage) {
    // Admin routes protection & canonical destination
    if (pathname.startsWith("/admin")) {
      if (normRole !== "admin" && normRole !== "super-admin") {
        return { allowed: false, redirectPath: "/forbidden", reason: "Standard user blocked from Admin route" };
      }
    }

    // Admin canonical destination enforcement (Requirement #7):
    // Admins visiting /tutor/*, /student/*, or onboarding pages are redirected to /admin/dashboard
    if (normRole === "admin" || normRole === "super-admin") {
      if (pathname.startsWith("/tutor") || pathname.startsWith("/student") || pathname === "/complete-profile" || pathname === "/choose-role") {
        return { allowed: false, redirectPath: "/admin/dashboard", reason: "Admin redirected to canonical Admin Console" };
      }
    }

    // Tutor routes protection
    if (pathname.startsWith("/tutor")) {
      if (normRole !== "tutor") {
        return { allowed: false, redirectPath: "/forbidden", reason: "Standard user blocked from Tutor route" };
      }
    }

    // Student routes protection
    if (pathname.startsWith("/student")) {
      if (normRole !== "student") {
        return { allowed: false, redirectPath: "/forbidden", reason: "Standard user blocked from Student route" };
      }
    }
  }

  return { allowed: true, reason: "Authorization access granted" };
}
