// src/app/api/tutor/courses/[courseId]/assignments/[assignmentId]/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../lib/supabase/server";
import { assignmentManagementService } from "../../../../../../../lib/services/assignmentManagementService";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string; assignmentId: string }> }
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
        { error: "Forbidden: Only tutors can modify assignments" },
        { status: 403 }
      );
    }

    const { assignmentId } = await params;
    const body = await request.json();

    const updatedAssignment = await assignmentManagementService.updateAssignment(assignmentId, body);
    return NextResponse.json(updatedAssignment);
  } catch (err: any) {
    console.error("Failed to update assignment:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update assignment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courseId: string; assignmentId: string }> }
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
        { error: "Forbidden: Only tutors can delete assignments" },
        { status: 403 }
      );
    }

    const { assignmentId } = await params;
    await assignmentManagementService.deleteAssignment(assignmentId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete assignment:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
