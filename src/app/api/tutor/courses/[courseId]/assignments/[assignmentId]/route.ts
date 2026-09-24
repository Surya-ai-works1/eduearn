// src/app/api/tutor/courses/[courseId]/assignments/[assignmentId]/route.ts

import { NextResponse } from "next/server";
import { getApiUser, verifyCourseOwnership } from "@/lib/apiAuth";
import { assignmentManagementService } from "../../../../../../../lib/services/assignmentManagementService";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string; assignmentId: string }> }
) {
  try {
    const auth = await getApiUser("tutor");
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { courseId, assignmentId } = await params;
    const ownership = await verifyCourseOwnership(courseId, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

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
    const auth = await getApiUser("tutor");
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { courseId, assignmentId } = await params;
    const ownership = await verifyCourseOwnership(courseId, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

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
