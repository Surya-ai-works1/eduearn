// src/app/api/student/certificates/issue/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { certificateService } from "../../../../../lib/services/certificateService";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required." }, { status: 400 });
    }

    const certificate = await certificateService.issueCertificate(user.id, courseId);
    return NextResponse.json({ success: true, certificate });
  } catch (err: any) {
    console.error("Failed to issue certificate:", err);
    return NextResponse.json({ error: err.message || "Failed to generate certificate." }, { status: 500 });
  }
}
