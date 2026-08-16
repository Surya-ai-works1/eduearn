// src/app/api/tutor/courses/[courseId]/quizzes/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import { quizManagementService } from "../../../../../../lib/services/quizManagementService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }
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
        { error: "Forbidden: Only tutors can manage quizzes" },
        { status: 403 }
      );
    }

    const { courseId } = await params;
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
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }
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
        { error: "Forbidden: Only tutors can manage quizzes" },
        { status: 403 }
      );
    }

    const { courseId } = await params;
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
