// src/app/api/tutor/courses/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { courseManagementService } from "../../../../lib/services/courseManagementService";

export async function GET(request: Request) {
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
        { error: "Forbidden: Only tutor accounts can access the course list" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await courseManagementService.getCourses(user.id, {
      search,
      category,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Failed to load courses:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load courses" },
      { status: 500 }
    );
  }
}

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

    // Role Verification (RBAC)
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile || profile.role !== "tutor") {
      return NextResponse.json(
        { error: "Forbidden: Only tutor accounts can create courses" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const courseData = {
      title: body.title || "",
      subtitle: body.subtitle || "",
      description: body.description || "",
      category: body.category || "",
      level: body.level || "beginner",
      language: body.language || "English",
      thumbnail: body.thumbnail || "",
      price: Number(body.price || 0),
      status: body.status || "draft",
      tags: body.tags || [],
    };

    const newCourse = await courseManagementService.createCourse(user.id, courseData);
    return NextResponse.json(newCourse);
  } catch (err: any) {
    console.error("Failed to create course:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
