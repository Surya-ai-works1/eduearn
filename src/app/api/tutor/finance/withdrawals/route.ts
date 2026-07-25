// src/app/api/tutor/finance/withdrawals/route.ts

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
        { error: "Forbidden: Only tutors can view withdrawals" },
        { status: 403 }
      );
    }

    const list = await financeManagementService.getWithdrawalRequests(user.id);
    return NextResponse.json(list);
  } catch (err: any) {
    console.error("Failed to load withdrawals:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load withdrawals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
        { error: "Forbidden: Only tutors can request withdrawals" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount, method, bankDetails } = body;

    const newRequest = await financeManagementService.requestWithdrawal(
      user.id,
      Number(amount),
      method || "UPI",
      bankDetails || ""
    );

    return NextResponse.json(newRequest);
  } catch (err: any) {
    console.error("Failed to request withdrawal:", err);
    return NextResponse.json(
      { error: err.message || "Failed to request withdrawal" },
      { status: 500 }
    );
  }
}
