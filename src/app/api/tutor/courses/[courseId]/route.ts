// src/app/api/tutor/courses/[courseId]/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { courseManagementService } from "../../../../../lib/services/courseManagementService";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
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
        { error: "Forbidden: Only tutor accounts can update courses" },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const body = await request.json();

    const updatedCourse = await courseManagementService.updateCourse(courseId, body, profile.role);
    return NextResponse.json(updatedCourse);
  } catch (err: any) {
    console.error("Failed to update course:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
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
        { error: "Forbidden: Only tutor accounts can delete courses" },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    await courseManagementService.deleteCourse(courseId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete course:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete course" },
      { status: 500 }
    );
  }
}
