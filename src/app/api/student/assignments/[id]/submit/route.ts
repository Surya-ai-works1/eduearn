// src/app/api/student/assignments/[id]/submit/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import { assignmentService } from "../../../../../../lib/services/assignmentService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const assignmentId = resolvedParams.id;

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { submissionUrl, submissionType = "file" } = body;

    if (!submissionUrl) {
      return NextResponse.json({ error: "Submission URL or file name is required." }, { status: 400 });
    }

    const submission = await assignmentService.submitAssignment(
      user.id,
      assignmentId,
      submissionUrl,
      submissionType
    );

    return NextResponse.json({ success: true, submission });
  } catch (err: any) {
    console.error("Assignment submission failed:", err);
    return NextResponse.json({ error: err.message || "Submission failed" }, { status: 500 });
  }
}
