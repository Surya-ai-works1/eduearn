// src/app/api/tutor/courses/[courseId]/quizzes/[quizId]/route.ts

import { NextResponse } from "next/server";
import { getApiUser, verifyCourseOwnership } from "@/lib/apiAuth";
import { quizManagementService } from "../../../../../../../lib/services/quizManagementService";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
  try {
    const auth = await getApiUser("tutor");
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { courseId, quizId } = await params;
    const ownership = await verifyCourseOwnership(courseId, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

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
    const auth = await getApiUser("tutor");
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { courseId, quizId } = await params;
    const ownership = await verifyCourseOwnership(courseId, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

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
