import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get("packageId");

    let query = supabase.from("package_tutor_assignments").select("*");
    if (packageId) {
      query = query.eq("package_id", packageId);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, assignments: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Error fetching package tutor assignments." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const body = await req.json();
    const { packageId, moduleId, tutorId, assignedSessions = 16, poolSharePercent = 20, startDate, endDate } = body;

    if (!packageId || !moduleId || !tutorId) {
      return NextResponse.json(
        { error: "Missing required assignment fields (packageId, moduleId, tutorId)." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("package_tutor_assignments")
      .upsert({
        package_id: packageId,
        module_id: moduleId,
        tutor_id: tutorId,
        assigned_sessions: assignedSessions,
        start_date: startDate || null,
        end_date: endDate || null,
        status: "active",
        payout_rule: { pool_share_percent: poolSharePercent },
        updated_at: new Date().toISOString(),
      }, { onConflict: "package_id,module_id,tutor_id" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      success: true,
      assignment: data,
      message: "Tutor assigned to package module successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Error saving package tutor assignment." }, { status: 500 });
  }
}
