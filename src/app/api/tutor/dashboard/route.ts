// src/app/api/tutor/dashboard/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { tutorDashboardService } from "../../../../lib/services/tutorDashboardService";

export async function GET() {
  try {
    const supabase = await createClient();
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
        { error: "Forbidden: Only tutor accounts can access the tutor dashboard data" },
        { status: 403 }
      );
    }

    const data = await tutorDashboardService.getDashboardData(user.id);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Failed to load tutor dashboard data:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load tutor dashboard data" },
      { status: 500 }
    );
  }
}
