// src/app/api/tutor/assignments/submissions/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { assignmentManagementService } from "../../../../../lib/services/assignmentManagementService";

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
        { error: "Forbidden: Only tutors can access submissions" },
        { status: 403 }
      );
    }

    const submissions = await assignmentManagementService.getSubmissions(user.id);
    return NextResponse.json(submissions);
  } catch (err: any) {
    console.error("Failed to load submissions:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load submissions" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
        { error: "Forbidden: Only tutors can grade submissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { submissionId, grade, feedback } = body;

    const result = await assignmentManagementService.gradeSubmission(submissionId, grade, feedback);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Failed to grade submission:", err);
    return NextResponse.json(
      { error: err.message || "Failed to grade submission" },
      { status: 500 }
    );
  }
}
