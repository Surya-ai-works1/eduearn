import { NextResponse } from "next/server";
import { createClient } from "./supabase/server";
import { IS_MOCK } from "./config";
import { normalizeRole, CanonicalRole, isPrimaryAdmin } from "@/utils/rbacResolver";

export async function getApiUser(requiredRole?: CanonicalRole) {
  if (IS_MOCK) {
    const role = requiredRole || "admin";
    // Simulated mock user structure mapping auth and profile properties
    return {
      user: {
        id: role === "admin" ? "mock-admin-id" : role === "tutor" ? "mock-tutor-id" : "mock-student-id",
        email: `${role}@eduearn.com`,
        user_metadata: {
          fullName: `Mock ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          role: role,
          complete: true
        }
      },
      profile: {
        role: role
      }
    };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      // Supabase not configured — treat as unauthenticated
      return { error: "Supabase is not configured on this server", status: 503 };
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthenticated", status: 401 };
    }

    const isSuperAdminEmail = isPrimaryAdmin(user.email);

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const rawRole = isSuperAdminEmail ? "admin" : (profile?.role || user.user_metadata?.role || "student");
    const userRole = normalizeRole(rawRole);

    if (requiredRole) {
      const normalizedRequired = normalizeRole(requiredRole);
      if (userRole !== normalizedRequired && !(userRole === "admin" && (normalizedRequired === "admin" || normalizedRequired === "super-admin"))) {
        return { error: "Forbidden", status: 403 };
      }
    }

    return { user, profile: { ...profile, role: userRole } };
  } catch (err: any) {
    return { error: err.message || "Authentication internal error", status: 500 };
  }
}
