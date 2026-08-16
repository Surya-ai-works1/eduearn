// src/app/api/tutor/application-status/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const auth = await getApiUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const tutorId = auth.user.id;

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("tutor_verifications")
      .select("*")
      .eq("tutor_id", tutorId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({
        status: "Pending",
        personal_info: {},
        academic_qualifications: [],
        teaching_experience: {},
        subject_selection: {},
        ai_evaluation: {},
        admin_notes: "",
        admin_feedback: "",
        rejection_reason: ""
      });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error fetching tutor application status:", err);
    return NextResponse.json({ error: err.message || "Failed to load application status" }, { status: 500 });
  }
}

// Support DELETE or Reset to support Reapply
export async function DELETE() {
  const auth = await getApiUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const tutorId = auth.user.id;

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }

    // Fetch the existing application to keep a trace in audit log
    const { data: app } = await supabase
      .from("tutor_verifications")
      .select("status, tutor_name")
      .eq("tutor_id", tutorId)
      .maybeSingle();

    // Delete existing tutor verification record so they can start fresh
    const { error } = await supabase
      .from("tutor_verifications")
      .delete()
      .eq("tutor_id", tutorId);

    if (error) throw error;

    // Reset user completion status in profiles
    await supabase
      .from("profiles")
      .update({ complete: false })
      .eq("id", tutorId);

    // Update user_metadata using admin client or instruct client side
    // Add to audit logs
    await supabase.from("audit_logs").insert({
      user_id: tutorId,
      action: "Tutor Application Reset",
      details: `Tutor ${app?.tutor_name || "Candidate"} reset their application to re-onboard after rejection.`,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: "Application reset successfully. You can now re-apply." });
  } catch (err: any) {
    console.error("Error resetting tutor application:", err);
    return NextResponse.json({ error: err.message || "Failed to reset application" }, { status: 500 });
  }
}
