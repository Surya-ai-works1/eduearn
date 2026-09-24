// src/app/api/tutor/courses/[courseId]/lessons/[lessonId]/route.ts

import { NextResponse } from "next/server";
import { getApiUser, verifyCourseOwnership } from "@/lib/apiAuth";
import { lessonManagementService } from "../../../../../../../lib/services/lessonManagementService";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const auth = await getApiUser("tutor");
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { courseId, lessonId } = await params;
    const ownership = await verifyCourseOwnership(courseId, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

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
    const auth = await getApiUser("tutor");
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { courseId, lessonId } = await params;
    const ownership = await verifyCourseOwnership(courseId, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

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
