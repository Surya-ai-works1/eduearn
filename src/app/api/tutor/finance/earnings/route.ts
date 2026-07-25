// src/app/api/tutor/finance/earnings/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { financeManagementService } from "../../../../../lib/services/financeManagementService";

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
        { error: "Forbidden: Only tutors can view finance details" },
        { status: 403 }
      );
    }

    const earnings = await financeManagementService.getTutorEarnings(user.id);
    return NextResponse.json(earnings);
  } catch (err: any) {
    console.error("Failed to load earnings:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load earnings" },
      { status: 500 }
    );
  }
}
