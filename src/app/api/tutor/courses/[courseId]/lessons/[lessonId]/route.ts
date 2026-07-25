// src/app/api/tutor/courses/[courseId]/lessons/[lessonId]/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../lib/supabase/server";
import { lessonManagementService } from "../../../../../../../lib/services/lessonManagementService";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
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
        { error: "Forbidden: Only tutors can update lessons" },
        { status: 403 }
      );
    }

    const { courseId, lessonId } = await params;
    const body = await request.json();

    const updatedLesson = await lessonManagementService.updateLesson(courseId, lessonId, body);
    return NextResponse.json(updatedLesson);
  } catch (err: any) {
    console.error("Failed to update lesson:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update lesson" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
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
        { error: "Forbidden: Only tutors can delete lessons" },
        { status: 403 }
      );
    }

    const { lessonId } = await params;
    await lessonManagementService.deleteLesson(lessonId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete lesson:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
