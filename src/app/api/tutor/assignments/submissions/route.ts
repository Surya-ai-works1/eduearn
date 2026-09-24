// src/app/api/tutor/assignments/submissions/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { createClient } from "@/lib/supabase/server";
import { assignmentManagementService } from "../../../../../lib/services/assignmentManagementService";

export async function GET() {
  try {
    const auth = await getApiUser("tutor");
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const submissions = await assignmentManagementService.getSubmissions(auth.user.id);
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
    const auth = await getApiUser("tutor");
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const body = await request.json();
    const { submissionId, grade, feedback } = body;

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }

    // Verify that this submission belongs to an assignment in a course taught by this tutor
    const supabase = await createClient();
    if (supabase) {
      const { data: subData, error: subErr } = await supabase
        .from("assignment_submissions")
        .select("id, assignment_id")
        .eq("id", submissionId)
        .maybeSingle();

      if (subErr || !subData) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }

      const { data: assignData, error: assignErr } = await supabase
        .from("assignments")
        .select("id, course_id")
        .eq("id", subData.assignment_id)
        .maybeSingle();

      if (assignErr || !assignData) {
        return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
      }

      const { data: courseData, error: courseErr } = await supabase
        .from("courses")
        .select("id, tutor_id")
        .eq("id", assignData.course_id)
        .maybeSingle();

      if (courseErr || !courseData) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      if (courseData.tutor_id !== auth.user.id) {
        return NextResponse.json(
          { error: "Forbidden: You do not own the course for this submission" },
          { status: 403 }
        );
      }
    }

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
