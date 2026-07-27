// src/app/api/tutor/submit-application/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const auth = await getApiUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const tutorId = auth.user.id;
  const tutorName = auth.user.user_metadata?.fullName || (auth.user.user_metadata as any)?.full_name || "Tutor Candidate";

  try {
    const supabase = await createClient();

    // Verify application existence
    const { data: app, error: fetchError } = await supabase
      .from("tutor_verifications")
      .select("id, status")
      .eq("tutor_id", tutorId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!app) {
      return NextResponse.json({ error: "Verification application draft not found." }, { status: 404 });
    }

    // Set application state to Under Review
    const { error: updateError } = await supabase
      .from("tutor_verifications")
      .update({
        status: "Under Review",
        updated_at: new Date().toISOString()
      })
      .eq("tutor_id", tutorId);

    if (updateError) throw updateError;

    // Log the event in audit logs
    await supabase.from("audit_logs").insert({
      user_id: tutorId,
      action: "Tutor Application Submitted",
      details: `Tutor ${tutorName} submitted their application for review.`,
      created_at: new Date().toISOString()
    });

    // Notify the user they submitted successfully
    try {
      const { notificationService } = await import("@/lib/services/notificationService");
      await notificationService.addActivity({
        studentId: tutorId,
        title: "Application Submitted Successfully",
        description: "Your tutor application is now Under Review. We will review your credentials shortly.",
        type: "certificate_earned",
        createdAt: new Date().toISOString()
      });
    } catch (notifyErr) {
      console.warn("Failed to create notification for submission:", notifyErr);
    }

    return NextResponse.json({ success: true, message: "Application submitted successfully." });
  } catch (err: any) {
    console.error("Error submitting tutor application:", err);
    return NextResponse.json({ error: err.message || "Failed to submit application" }, { status: 500 });
  }
}
