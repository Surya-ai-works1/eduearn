// src/lib/apiAuth.ts

import { NextResponse } from "next/server";
import { createClient } from "./supabase/server";
import { IS_MOCK } from "./config";

export async function getApiUser(requiredRole?: "student" | "tutor" | "admin") {

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
