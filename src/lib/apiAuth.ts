// src/lib/apiAuth.ts

import { NextResponse } from "next/server";
import { createClient } from "./supabase/server";
import { IS_MOCK } from "./config";

export async function getApiUser(requiredRole?: "student" | "tutor" | "admin") {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthenticated", status: 401 };
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return { error: "Profile not found", status: 404 };
    }

    if (requiredRole && profile.role !== requiredRole) {
      return { error: "Forbidden", status: 403 };
    }

    return { user, profile };
  } catch (err: any) {
    return { error: err.message || "Authentication internal error", status: 500 };
  }
}
