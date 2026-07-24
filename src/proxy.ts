import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "./lib/supabase/server";

/**
 * EduEarn Proxy (formerly middleware)
 *
 * Renamed from middleware.ts → proxy.ts per Next.js v16 convention.
 * The function name changes from `middleware` to `proxy`.
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
    url.pathname.startsWith("/tutor/register");

  const isProtectedPage =
    url.pathname.startsWith("/complete-profile") ||
    url.pathname.startsWith("/choose-role") ||
    url.pathname.startsWith("/welcome") ||
    (url.pathname.startsWith("/tutor") &&
      !url.pathname.startsWith("/tutor/login") &&
      !url.pathname.startsWith("/tutor/register")) ||
    url.pathname.startsWith("/student") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/profile") ||
    url.pathname.startsWith("/settings") ||
    url.pathname.startsWith("/learn") ||
    url.pathname.startsWith("/dashboard");

  // ── Session detection ────────────────────────────────────────────────────
  // If Supabase is not configured, skip remote checks.
  if (!supabase) {
    return response;
  }

  // getUser() is authoritative — it validates the token with the Supabase server.
  // This also silently refreshes the access token when it is close to expiry.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Email Verification Guard ─────────────────────────────────────────────
  if (user) {
    const isEmailConfirmed = !!user.email_confirmed_at;
    const isVerificationBypassPath =
      url.pathname.startsWith("/verify-email") ||
      url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/register") ||
      url.pathname.startsWith("/forgot-password") ||
      url.pathname.startsWith("/reset-password") ||
      url.pathname.startsWith("/auth/callback") ||
      url.pathname.startsWith("/api/");

    if (!isEmailConfirmed) {
      // If email is not confirmed, redirect any non-bypass page request to /verify-email
      if (!isVerificationBypassPath) {
        url.pathname = "/verify-email";
        url.searchParams.set("email", user.email || "");
        return NextResponse.redirect(url);
      }
    } else {
      // If email IS confirmed, and they try to visit /verify-email, bypass it
      if (url.pathname.startsWith("/verify-email")) {
        const metadata = user.user_metadata ?? {};
        const role = metadata.role as string | undefined;
        const hasRole =
          role === "learner" ||
          role === "student" ||
          role === "tutor" ||
          role === "admin";
        const isComplete = metadata.complete === true;

        if (!hasRole) {
          url.pathname = "/choose-role";
        } else if (!isComplete) {
          url.pathname = "/complete-profile";
        } else {
          if (role === "admin") {
            url.pathname = "/admin/dashboard";
          } else if (role === "tutor") {
            url.pathname = "/tutor/dashboard";
          } else {
            url.pathname = "/learn";
          }
        }
        return NextResponse.redirect(url);
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
    return NextResponse.redirect(url);
  }

  // ── 2. Authenticated → auth page ─────────────────────────────────────────
  if (user && isAuthPage) {
    const metadata = user.user_metadata ?? {};
    const role = metadata.role as string | undefined;
    const hasRole =
      role === "learner" ||
      role === "student" ||
      role === "tutor" ||
      role === "admin";
    const isComplete = metadata.complete === true;

    if (!hasRole) {
      url.pathname = "/choose-role";
    } else if (!isComplete) {
      if (role === "tutor") {
        url.pathname = "/tutor/onboarding";
      } else {
        url.pathname = "/complete-profile";
      }
    } else {
      // Send to role-specific dashboard, not always /welcome
      if (role === "admin") {
        url.pathname = "/admin/dashboard";
      } else if (role === "tutor") {
        url.pathname = "/tutor/dashboard";
      } else {
        url.pathname = "/learn";
      }
    }

    return NextResponse.redirect(url);
  }

  // ── 3. Authenticated + incomplete onboarding ──────────────────────────────
  if (user && isProtectedPage) {
    const metadata = user.user_metadata ?? {};
    const hasRole =
      metadata.role === "learner" ||
      metadata.role === "student" ||
      metadata.role === "tutor" ||
      metadata.role === "admin";
    const isComplete = metadata.complete === true;

    if (!hasRole && url.pathname !== "/choose-role") {
      url.pathname = "/choose-role";
      return NextResponse.redirect(url);
    }

    // Tutors go to /tutor/onboarding, Students go to /complete-profile
    if (hasRole && !isComplete) {
      if (metadata.role === "tutor") {
        if (url.pathname !== "/tutor/onboarding") {
          url.pathname = "/tutor/onboarding";
          return NextResponse.redirect(url);
        }
      } else {
        if (url.pathname !== "/complete-profile") {
          url.pathname = "/complete-profile";
          return NextResponse.redirect(url);
        }
      }
    }

    // Redirect already completed users away from onboarding pages
    if (hasRole && isComplete && (url.pathname === "/choose-role" || url.pathname === "/complete-profile" || url.pathname === "/tutor/onboarding")) {
      const role = metadata.role;
      if (role === "admin") {
        url.pathname = "/admin/dashboard";
      } else if (role === "tutor") {
        url.pathname = "/tutor/dashboard";
      } else {
        url.pathname = "/learn";
      }
      return NextResponse.redirect(url);
    }
  }

  // ── 4. Role-based Access Control (RBAC) security checks ─────────────────
  if (user && isProtectedPage) {
    const metadata = user.user_metadata ?? {};
    const role = metadata.role;

    // Learner/Student cannot access tutor/admin paths (except tutor onboarding)
    if (role === "learner" || role === "student") {
      if (
        (url.pathname.startsWith("/tutor") && !url.pathname.startsWith("/tutor/onboarding")) ||
        url.pathname.startsWith("/admin")
      ) {
        url.pathname = "/forbidden";
        return NextResponse.redirect(url);
      }
    }

    // Tutor cannot access admin paths
    if (role === "tutor") {
      if (url.pathname.startsWith("/admin")) {
        url.pathname = "/forbidden";
        return NextResponse.redirect(url);
      }
    }
  }

  // Pass through — return the mutated response so Supabase can set refreshed cookies.
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
