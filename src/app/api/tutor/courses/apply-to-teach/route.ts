// src/app/api/tutor/courses/apply-to-teach/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const auth = await getApiUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const userId = auth.user.id;

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured on server" }, { status: 503 });
    }

    // 1. RBAC Guard: Verify user has an approved tutor profile
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", userId)
      .maybeSingle();

    if (profileErr || !profile || profile.role !== "tutor") {
      return NextResponse.json(
        { error: "Forbidden: Only verified tutor accounts can apply to teach courses." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseId, applicationNote } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Missing required field: courseId" }, { status: 400 });
    }

    // 2. Course Existence Check
    const { data: course, error: courseErr } = await supabase
      .from("courses")
      .select("id, title, tutor_id")
      .eq("id", courseId)
      .maybeSingle();

    if (courseErr || !course) {
      return NextResponse.json({ error: "Course template not found." }, { status: 404 });
    }

    // If course already has a primary tutor assigned, prevent application unless reassignment
    if (course.tutor_id && course.tutor_id !== userId) {
      // Check if tutor_id belongs to an active tutor profile
      const { data: existingTutor } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", course.tutor_id)
        .maybeSingle();

      if (existingTutor && existingTutor.role === "tutor") {
        return NextResponse.json(
          { error: "This course is already assigned to an active tutor." },
          { status: 400 }
        );
      }
    }

    // 3. Duplicate Active Application Check
    const { data: existingApp } = await supabase
      .from("course_tutor_applications")
      .select("id, status")
      .eq("tutor_id", userId)
      .eq("course_id", courseId)
      .eq("status", "UNDER_REVIEW")
      .maybeSingle();

    if (existingApp) {
      return NextResponse.json(
        { error: "You already have an active application under review for this course template." },
        { status: 400 }
      );
    }

    // 4. Create Application (Status: UNDER_REVIEW)
    // Note: courses.tutor_id is NOT modified here! It remains unassigned until Admin approval.
    const { data: newApp, error: insertErr } = await supabase
      .from("course_tutor_applications")
      .insert({
        course_id: courseId,
        tutor_id: userId,
        status: "UNDER_REVIEW",
        application_note: applicationNote || "Tutor candidate application to teach course template.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertErr) {
      if (insertErr.code === "23505") {
        return NextResponse.json(
          { error: "You already have an active application under review for this course." },
          { status: 400 }
        );
      }
      throw insertErr;
    }

    // 5. Audit Log
    try {
      await supabase.from("audit_logs").insert({
        user_id: userId,
        action: "Course Teach Application Submitted",
        details: `Tutor ${profile.full_name || userId} applied to teach course "${course.title}" (${courseId}).`,
        created_at: new Date().toISOString()
      });
    } catch (logErr) {
      console.warn("Audit log insert failed:", logErr);
    }

    // 6. Notification
    try {
      const { notificationService } = await import("@/lib/services/notificationService");
      await notificationService.addActivity({
        studentId: userId,
        title: "Course Application Submitted",
        description: `Your application to teach "${course.title}" is under admin review.`,
        type: "course_enrolled",
        createdAt: new Date().toISOString()
      });
    } catch (notifyErr) {
      console.warn("Notification trigger failed:", notifyErr);
    }

    return NextResponse.json({
      success: true,
      application: newApp,
      message: "Application to teach submitted successfully. It is now under admin review."
    });

  } catch (err: any) {
    console.error("Apply to teach error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit application to teach" }, { status: 500 });
  }
}
