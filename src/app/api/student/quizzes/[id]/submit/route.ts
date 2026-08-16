// src/app/api/student/quizzes/[id]/submit/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import { quizService } from "../../../../../../lib/services/quizService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const quizId = resolvedParams.id;

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = body;

    if (!answers) {
      return NextResponse.json({ error: "Quiz answers are required." }, { status: 400 });
    }

    const result = await quizService.submitQuiz(user.id, quizId, answers);

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Quiz submission failed:", err);
    return NextResponse.json({ error: err.message || "Quiz submission failed" }, { status: 500 });
  }
}
