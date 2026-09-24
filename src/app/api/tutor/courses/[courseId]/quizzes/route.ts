// src/app/api/tutor/courses/[courseId]/quizzes/route.ts

import { NextResponse } from "next/server";
import { getApiUser, verifyCourseOwnership } from "@/lib/apiAuth";
import { quizManagementService } from "../../../../../../lib/services/quizManagementService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const auth = await getApiUser("tutor");
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { courseId } = await params;
    const ownership = await verifyCourseOwnership(courseId, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const filterStatus = searchParams.get("status") || "all";
    const page = Number(searchParams.get("page") || "1");

    const result = await quizManagementService.getQuizzes(courseId, search, filterStatus, page);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Failed to load quizzes:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load quizzes" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const auth = await getApiUser("tutor");
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { courseId } = await params;
    const ownership = await verifyCourseOwnership(courseId, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

    const body = await request.json();

    const quizData = {
      title: body.title || "",
      description: body.description || "",
      passingScore: Number(body.passingScore || 60),
      timeLimit: Number(body.timeLimit || 30),
      questions: body.questions || [],
      status: body.status || "published",
    };

    const newQuiz = await quizManagementService.createQuiz(courseId, quizData);
    return NextResponse.json(newQuiz);
  } catch (err: any) {
    console.error("Failed to create quiz:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create quiz" },
      { status: 500 }
    );
  }
}
