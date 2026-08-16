// src/app/api/tutor/quizzes/attempts/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { quizManagementService } from "../../../../../lib/services/quizManagementService";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Role Verification (RBAC)
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile || profile.role !== "tutor") {
      return NextResponse.json(
        { error: "Forbidden: Only tutors can access attempts" },
        { status: 403 }
      );
    }

    const attempts = await quizManagementService.getAttempts(user.id);
    return NextResponse.json(attempts);
  } catch (err: any) {
    console.error("Failed to load attempts:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load attempts" },
      { status: 500 }
    );
  }
}
