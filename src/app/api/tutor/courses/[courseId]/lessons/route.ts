// src/app/api/tutor/courses/[courseId]/lessons/route.ts

import { NextResponse } from "next/server";
import { getApiUser, verifyCourseOwnership } from "@/lib/apiAuth";
import { lessonManagementService } from "../../../../../../lib/services/lessonManagementService";

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
