import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "./lib/supabase/server";
import { resolveRouteDecision, getPermissionsCountForRole, normalizeRole, type CanonicalRole } from "./utils/rbacResolver";

/**
 * EduEarn Proxy
 *
 * Responsibilities:
 * 1. Refresh the Supabase session on every request (keeps tokens from expiring).
 * 2. Redirect unauthenticated users away from protected routes → /login.
 * 3. Redirect authenticated users away from auth pages → appropriate onboarding step.
 *
 * Session detection uses Supabase SSR cookies (sb-*) with authoritative server
 * validation via getUser(), NOT a custom cookie. This works correctly with
 * Supabase's token rotation and prevents stale session issues.
 *
 * The /auth/callback route is excluded so the code exchange completes
 * before we check the session.
 */
// Rate limiting simulation (placeholder for production Upstash/Redis caching store)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 150;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rateData = rateLimitMap.get(ip);

  if (!rateData) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (now > rateData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  rateData.count += 1;
  return rateData.count > MAX_REQUESTS_PER_MINUTE;
}

// Helper function to create a redirect response and copy session/auth cookies from the baseResponse
function createRedirectResponse(url: URL, baseResponse: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  baseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      domain: cookie.domain,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      expires: cookie.expires,
      maxAge: cookie.maxAge,
      httpOnly: cookie.httpOnly,
    });
  });
  return redirectResponse;
}

export async function proxy(request: NextRequest) {


  // 1. Rate Limiting Protection Check
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip)) {
    return new NextResponse("Too Many Requests. Rate limit exceeded.", { 
      status: 429,
      headers: { "Retry-After": "60" } 
    });
  }

  // 2. CSRF Verification for mutable HTTP requests
  if (request.method !== "GET" && request.method !== "HEAD" && request.method !== "OPTIONS") {
    const origin = request.headers.get("origin");
    if (origin) {
      try {
        const originUrl = new URL(origin);
        const forwardedHost = request.headers.get("x-forwarded-host");
        const host = forwardedHost || request.headers.get("host");

        // Allow bypass if both origin and host are Vercel domains (e.g. aliases/deployments)
        const isVercelAlias =
          originUrl.host.endsWith(".vercel.app") &&
          host &&
          host.endsWith(".vercel.app");

        if (host && originUrl.host !== host && !isVercelAlias) {
          return new NextResponse("CSRF Verification Failed", { status: 403 });
        }
      } catch {
        return new NextResponse("Invalid Origin Header", { status: 400 });
      }
    }
  }

  const { supabase, response } = createMiddlewareClient(request);
  const url = request.nextUrl.clone();

  // ── Route categorisation ─────────────────────────────────────────────────
  const isAuthPage =
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/register") ||
    url.pathname.startsWith("/tutor/login") ||
    url.pathname.startsWith("/tutor/register") ||
    url.pathname.startsWith("/student/login") ||
    url.pathname.startsWith("/student/register");

  const isProtectedPage =
    url.pathname.startsWith("/complete-profile") ||
    url.pathname.startsWith("/choose-role") ||
    url.pathname.startsWith("/welcome") ||
    (url.pathname.startsWith("/tutor") &&
      !url.pathname.startsWith("/tutor/login") &&
      !url.pathname.startsWith("/tutor/register")) ||
    (url.pathname.startsWith("/student") &&
      !url.pathname.startsWith("/student/login") &&
      !url.pathname.startsWith("/student/register")) ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/profile") ||
    url.pathname.startsWith("/settings") ||
    url.pathname.startsWith("/learn") ||
    url.pathname.startsWith("/dashboard");

  // ── Session detection & Authoritative Database Role Retrieval ───────────
  if (!supabase) {
    return response;
  }

  let user = null;
  let userRole: CanonicalRole = "student";

  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    user = fetchedUser;

    if (user) {
      const isSuperAdminEmail = user.email === "suryasaiteja2005@gmail.com";
      if (isSuperAdminEmail) {
        userRole = "admin";
      } else {
        // Query authoritative profiles table for database role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        const metadata = user.user_metadata ?? {};
        const appMetadata = user.app_metadata ?? {};
        const rawRole = profile?.role || metadata.role || appMetadata.role || "student";
        userRole = normalizeRole(rawRole);
      }
    }
  } catch (err) {
    console.error("Supabase session verification failed:", err);
    if (isProtectedPage) {
      const loginUrl = request.nextUrl.clone();
      if (request.nextUrl.pathname.startsWith("/tutor")) {
        loginUrl.pathname = "/tutor/login";
      } else {
        loginUrl.pathname = "/login";
      }
      loginUrl.searchParams.set("error", "connection_error");
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return createRedirectResponse(loginUrl, response);
    }
  }

  // ── Email Verification Guard ─────────────────────────────────────────────
  if (user) {
    const isVerificationBypassPath =
      url.pathname.startsWith("/verify-email") ||
      url.pathname.startsWith("/verify-otp") ||
      url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/register") ||
      url.pathname.startsWith("/forgot-password") ||
      url.pathname.startsWith("/reset-password") ||
      url.pathname.startsWith("/auth/callback") ||
      url.pathname.startsWith("/api/");
    const isEmailConfirmed = !!user.email_confirmed_at;
    // If email is not confirmed, redirect any non-bypass page request to /verify-otp
    if (!isEmailConfirmed) {
      if (!isVerificationBypassPath) {
        url.pathname = "/verify-otp";
        url.searchParams.set("email", user.email || "");
        return createRedirectResponse(url, response);
      }
    } else {
      // If email IS confirmed, and they try to visit /verify-email or /verify-otp, bypass it
      if (url.pathname.startsWith("/verify-email") || url.pathname.startsWith("/verify-otp")) {
        const metadata = user.user_metadata ?? {};
        const isComplete = metadata.complete !== false;

        if (!isComplete) {
          if (userRole === "tutor") {
            url.pathname = "/tutor/onboarding";
          } else {
            url.pathname = "/complete-profile";
          }
        } else {
          if (userRole === "admin" || userRole === "super-admin") {
            url.pathname = "/admin/dashboard";
          } else if (userRole === "tutor") {
            url.pathname = "/tutor/dashboard";
          } else {
            url.pathname = "/student/dashboard";
          }
        }
        return createRedirectResponse(url, response);
      }
    }
  }

  // ── 1. Unauthenticated → protected page ──────────────────────────────────
  if (!user && isProtectedPage) {
    if (url.pathname.startsWith("/tutor")) {
      url.pathname = "/tutor/login";
    } else {
      url.pathname = "/login";
    }
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return createRedirectResponse(url, response);
  }

  // ── 2. Authenticated → auth page ─────────────────────────────────────────
  if (user && isAuthPage) {
    const metadata = user.user_metadata ?? {};
    const isComplete = metadata.complete !== false;

    if (!isComplete) {
      if (userRole === "tutor") {
        url.pathname = "/tutor/onboarding";
      } else {
        url.pathname = "/complete-profile";
      }
    } else {
      if (userRole === "admin" || userRole === "super-admin") {
        url.pathname = "/admin/dashboard";
      } else if (userRole === "tutor") {
        url.pathname = "/tutor/dashboard";
      } else {
        url.pathname = "/student/dashboard";
      }
    }

    return createRedirectResponse(url, response);
  }

  // ── 3. Authenticated + incomplete onboarding ──────────────────────────────
  if (user && isProtectedPage) {
    const metadata = user.user_metadata ?? {};
    const isComplete = metadata.complete !== false;

    // Tutors go to /tutor/onboarding, Students go to /complete-profile
    if (!isComplete) {
      if (userRole === "tutor") {
        if (url.pathname !== "/tutor/onboarding") {
          url.pathname = "/tutor/onboarding";
          return createRedirectResponse(url, response);
        }
      } else if (userRole === "student") {
        if (url.pathname !== "/complete-profile") {
          url.pathname = "/complete-profile";
          return createRedirectResponse(url, response);
        }
      }
    }

    // Redirect already completed users away from onboarding pages
    if (isComplete && (url.pathname === "/choose-role" || url.pathname === "/complete-profile" || url.pathname === "/tutor/onboarding")) {
      if (userRole === "admin" || userRole === "super-admin") {
        url.pathname = "/admin/dashboard";
      } else if (userRole === "tutor") {
        url.pathname = "/tutor/dashboard";
      } else {
        url.pathname = "/student/dashboard";
      }
      return createRedirectResponse(url, response);
    }
  }

  // ── 4. Role-based Access Control (RBAC) security checks ─────────────────
  if (user && isProtectedPage) {
    // Learner/Student cannot access tutor/admin paths (except tutor onboarding)
    if (userRole === "student") {
      if (
        (url.pathname.startsWith("/tutor") && !url.pathname.startsWith("/tutor/onboarding")) ||
        url.pathname.startsWith("/admin")
      ) {
        url.pathname = "/forbidden";
        return createRedirectResponse(url, response);
      }
    }

    // Tutor cannot access admin paths
    if (userRole === "tutor") {
      if (url.pathname.startsWith("/admin")) {
        url.pathname = "/forbidden";
        return createRedirectResponse(url, response);
      }
    }

    // Admin redirected from /tutor/* or /student/* to canonical Admin Console
    if (userRole === "admin" || userRole === "super-admin") {
      if (url.pathname.startsWith("/tutor") || url.pathname.startsWith("/student")) {
        url.pathname = "/admin/dashboard";
        return createRedirectResponse(url, response);
      }
    }
  }

  // Pass through - return the mutated response so Supabase can set refreshed cookies.
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt
     * - /auth/callback (Supabase code exchange must not be intercepted)
     * - Public API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|auth/callback|api/).*)",
  ],
};
