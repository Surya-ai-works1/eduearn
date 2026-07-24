import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "../../../utils/env";

/**
 * Supabase Auth Callback Route
 *
 * Handles redirects from Supabase email links:
 * - Email verification (signup)
 * - Password reset
 * - Magic link sign-in (future)
 *
 * Supabase appends a `code` query param to the redirect URL.
 * This route exchanges that code for a server-side session,
 * then redirects the user to their intended destination.
 *
 * Security: Code exchange happens server-side; no secrets are exposed to the client.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/welcome";

  // If there is no code, redirect to login with an error
  if (!code) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(loginUrl);
  }

  // Gracefully handle missing environment variables
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "configuration");
    return NextResponse.redirect(loginUrl);
  }

  // Create a response first so setAll can write cookies to it
  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // 1. Exchange the one-time code for a persistent session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("[DIAGNOSTIC CALLBACK] Code exchange failed:", error);
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "exchange_failed");
    return NextResponse.redirect(loginUrl);
  }

  console.log("[DIAGNOSTIC CALLBACK] Code exchange succeeded:", {
    sessionExists: !!data.session,
    userId: data.session.user.id,
    email: data.session.user.email,
    exchangeSuccess: true
  });

  // Success — return the redirect response containing the session cookies
  return response;
}
