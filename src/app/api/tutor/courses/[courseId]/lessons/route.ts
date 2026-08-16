// src/app/api/tutor/courses/[courseId]/lessons/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import { lessonManagementService } from "../../../../../../lib/services/lessonManagementService";

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
        { error: "Forbidden: Only tutors can manage lessons" },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const lessons = await lessonManagementService.getLessons(courseId);
    return NextResponse.json(lessons);
  } catch (err: any) {
    console.error("Failed to load lessons:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load lessons" },
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
        { error: "Forbidden: Only tutors can manage lessons" },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const body = await request.json();

    const lessonData = {
      title: body.title || "",
      description: body.description || "",
      lessonType: body.lessonType || "Video",
      videoUrl: body.videoUrl || "",
      duration: Number(body.duration || 0),
      order: Number(body.order || 0),
      resources: body.resources || [],
      status: body.status || "published",
    };

    const newLesson = await lessonManagementService.createLesson(courseId, lessonData);
    return NextResponse.json(newLesson);
  } catch (err: any) {
    console.error("Failed to create lesson:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create lesson" },
      { status: 500 }
    );
  }
}

// PUT /api/tutor/courses/[courseId]/lessons handles reordering (orderedIds in body)
export async function PUT(
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
        { error: "Forbidden: Only tutors can manage lessons" },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const body = await request.json();

    if (!body.orderedIds || !Array.isArray(body.orderedIds)) {
      return NextResponse.json({ error: "orderedIds array is required" }, { status: 400 });
    }

    await lessonManagementService.updateLessonOrder(courseId, body.orderedIds);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to reorder lessons:", err);
    return NextResponse.json(
      { error: err.message || "Failed to reorder lessons" },
      { status: 500 }
    );
  }
}
