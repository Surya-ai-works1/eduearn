// src/app/api/tutor/courses/[courseId]/quizzes/[quizId]/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../lib/supabase/server";
import { quizManagementService } from "../../../../../../../lib/services/quizManagementService";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
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
        { error: "Forbidden: Only tutors can modify quizzes" },
        { status: 403 }
      );
    }

    const { quizId } = await params;
    const body = await request.json();

    const updatedQuiz = await quizManagementService.updateQuiz(quizId, body);
    return NextResponse.json(updatedQuiz);
  } catch (err: any) {
    console.error("Failed to update quiz:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update quiz" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
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
        { error: "Forbidden: Only tutors can delete quizzes" },
        { status: 403 }
      );
    }

    const { quizId } = await params;
    await quizManagementService.deleteQuiz(quizId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete quiz:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
