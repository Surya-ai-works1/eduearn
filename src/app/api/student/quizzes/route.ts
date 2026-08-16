// src/app/api/student/quizzes/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { quizService } from "../../../../lib/services/quizService";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const quizzes = await quizService.getStudentQuizzes(user.id);
    return NextResponse.json({ quizzes });
  } catch (err: any) {
    console.error("Failed to load student quizzes:", err);
    return NextResponse.json({ error: err.message || "Failed to load quizzes" }, { status: 500 });
  }
}
