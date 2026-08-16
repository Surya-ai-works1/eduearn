// src/app/api/tutor/submit-step/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const auth = await getApiUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const tutorId = auth.user.id;
  const tutorName = auth.user.user_metadata?.fullName || (auth.user.user_metadata as any)?.full_name || "Tutor Candidate";

  try {
    const body = await request.json();
    const { stepName, data } = body;

    if (!stepName || !data) {
      return NextResponse.json({ error: "Missing stepName or data" }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }

    // Verify if verification record already exists
    const { data: existing, error: fetchError } = await supabase
      .from("tutor_verifications")
      .select("id")
      .eq("tutor_id", tutorId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // Define column name to update based on step name
    let updateColumn = "";
    if (stepName === "personal_info") updateColumn = "personal_info";
    else if (stepName === "academic_qualifications") updateColumn = "academic_qualifications";
    else if (stepName === "teaching_experience") updateColumn = "teaching_experience";
    else if (stepName === "subject_selection") updateColumn = "subject_selection";
    else if (stepName === "documents") {
      // Handles document URLs directly
      const { gov_id_url, degree_url, certificates_url, resume_url, video_demo_url } = data;
      const payload: any = {
        updated_at: new Date().toISOString()
      };
      if (gov_id_url) payload.gov_id_url = gov_id_url;
      if (degree_url) payload.degree_url = degree_url;
      if (certificates_url) payload.certificates_url = certificates_url;
      if (resume_url) payload.resume_url = resume_url;
      if (video_demo_url) payload.video_demo_url = video_demo_url;
      
      // Update application status when documents are uploaded
      payload.status = "Documents Submitted";

      if (existing) {
        const { error: updateError } = await supabase
          .from("tutor_verifications")
          .update(payload)
          .eq("tutor_id", tutorId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("tutor_verifications")
          .insert({
            tutor_id: tutorId,
            tutor_name: tutorName,
            status: "Documents Submitted",
            ...payload
          });
        if (insertError) throw insertError;
      }

      // Add to audit logs
      await supabase.from("audit_logs").insert({
        user_id: tutorId,
        action: "Tutor Documents Uploaded",
        details: `Tutor ${tutorName} uploaded onboarding credentials.`,
        created_at: new Date().toISOString()
      });

      return NextResponse.json({ success: true, message: "Documents saved successfully" });
    }

    if (!updateColumn) {
      return NextResponse.json({ error: "Invalid stepName specified" }, { status: 400 });
    }

    const payload: any = {
      [updateColumn]: data,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      const { error: updateError } = await supabase
        .from("tutor_verifications")
        .update(payload)
        .eq("tutor_id", tutorId);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("tutor_verifications")
        .insert({
          tutor_id: tutorId,
          tutor_name: tutorName,
          status: "Pending",
          ...payload
        });
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true, message: `${stepName} step saved successfully` });
  } catch (err: any) {
    console.error("Error saving tutor onboarding step:", err);
    return NextResponse.json({ error: err.message || "Failed to save step details" }, { status: 500 });
  }
}
