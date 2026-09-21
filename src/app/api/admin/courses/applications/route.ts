// src/app/api/admin/courses/applications/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase unconfigured on server" }, { status: 503 });
    }

    const { data: apps, error } = await supabase
      .from("course_tutor_applications")
      .select("*, courses:course_id(id, title, category, price, status, approval_status, tutor_id), profiles:tutor_id(id, full_name, email, role, avatar_url)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ applications: apps || [] });
  } catch (err: any) {
    console.error("Admin fetch course applications error:", err);
    return NextResponse.json({ error: err.message || "Failed to load course applications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const adminId = auth.user.id;
  const adminName = auth.user.user_metadata?.fullName || "Admin Operations";

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase unconfigured on server" }, { status: 503 });
    }

    const body = await request.json();
    const { applicationId, action, adminFeedback } = body;

    if (!applicationId || !action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Missing or invalid parameters: applicationId, action (APPROVE|REJECT)" }, { status: 400 });
    }

    // 1. Fetch application record
    const { data: app, error: appErr } = await supabase
      .from("course_tutor_applications")
      .select("*, courses:course_id(*), profiles:tutor_id(*)")
      .eq("id", applicationId)
      .maybeSingle();

    if (appErr || !app) {
      return NextResponse.json({ error: "Course tutor application not found." }, { status: 404 });
    }

    if (action === "APPROVE") {
      // 2. Race Condition Guard: Verify course is not already owned by another legitimate tutor
      const { data: currentCourse } = await supabase
        .from("courses")
        .select("id, tutor_id, title")
        .eq("id", app.course_id)
        .single();

      if (currentCourse?.tutor_id && currentCourse.tutor_id !== app.tutor_id) {
        // Verify if current tutor_id belongs to a legitimate tutor profile
        const { data: existingTutor } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", currentCourse.tutor_id)
          .maybeSingle();

        if (existingTutor && existingTutor.role === "tutor") {
          return NextResponse.json(
            { error: `Race condition prevented: Course "${currentCourse.title}" is already assigned to active tutor ${existingTutor.id}.` },
            { status: 409 }
          );
        }
      }

      // 3. Verify applicant profile is an approved tutor
      const { data: tutorProfile } = await supabase
        .from("profiles")
        .select("id, role, full_name")
        .eq("id", app.tutor_id)
        .single();

      if (!tutorProfile || tutorProfile.role !== "tutor") {
        return NextResponse.json(
          { error: "Cannot approve: Applicant does not have a verified tutor profile (role = tutor)." },
          { status: 400 }
        );
      }

      // 4. Update Course: assign tutor_id and move course to under_review state (NOT auto-published)
      // Atomic check: Only update if tutor_id is currently null OR already assigned to this tutor
      const { data: updatedCourse, error: courseUpdateErr } = await supabase
        .from("courses")
        .update({
          tutor_id: app.tutor_id,
          approval_status: "under_review",
          status: "draft",
          updated_at: new Date().toISOString()
        })
        .eq("id", app.course_id)
        .or(`tutor_id.is.null,tutor_id.eq.${app.tutor_id}`)
        .select()
        .maybeSingle();

      if (courseUpdateErr) throw courseUpdateErr;

      if (!updatedCourse) {
        return NextResponse.json(
          { error: `Race condition prevented: Course "${app.courses?.title}" has already been assigned to another tutor.` },
          { status: 409 }
        );
      }

      // 5. Update Application Status to APPROVED
      const { data: updatedApp, error: appUpdateErr } = await supabase
        .from("course_tutor_applications")
        .update({
          status: "APPROVED",
          admin_feedback: adminFeedback || "Application approved by admin.",
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", applicationId)
        .select()
        .single();

      if (appUpdateErr) throw appUpdateErr;

      // 6. Automatically mark other pending applications for this same course as REJECTED / SUPERSEDED
      await supabase
        .from("course_tutor_applications")
        .update({
          status: "REJECTED",
          admin_feedback: "Course was assigned to another approved applicant.",
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("course_id", app.course_id)
        .eq("status", "UNDER_REVIEW")
        .neq("id", applicationId);

      // 7. Audit log & notification
      try {
        await supabase.from("audit_logs").insert({
          user_id: adminId,
          action: "Course Tutor Application Approved",
          details: `Admin ${adminName} approved Tutor ${tutorProfile.full_name} for course "${app.courses?.title}".`,
          created_at: new Date().toISOString()
        });

        const { notificationService } = await import("@/lib/services/notificationService");
        await notificationService.createNotification(
          app.tutor_id,
          "Course Application Approved!",
          `Congratulations! Your application to teach "${app.courses?.title}" has been approved.`,
          "course"
        );
      } catch (logErr) {
        console.warn("Audit/Notification log failed:", logErr);
      }

      return NextResponse.json({
        success: true,
        application: updatedApp,
        message: `Successfully approved tutor ${tutorProfile.full_name} for course "${app.courses?.title}".`
      });

    } else {
      // REJECT Action
      const { data: updatedApp, error: appUpdateErr } = await supabase
        .from("course_tutor_applications")
        .update({
          status: "REJECTED",
          admin_feedback: adminFeedback || "Application rejected by admin.",
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", applicationId)
        .select()
        .single();

      if (appUpdateErr) throw appUpdateErr;

      try {
        const { notificationService } = await import("@/lib/services/notificationService");
        await notificationService.createNotification(
          app.tutor_id,
          "Course Application Update",
          `Your application to teach "${app.courses?.title}" was not approved at this time.`,
          "course"
        );
      } catch (logErr) {}

      return NextResponse.json({
        success: true,
        application: updatedApp,
        message: `Application rejected.`
      });
    }

  } catch (err: any) {
    console.error("Admin course application review error:", err);
    return NextResponse.json({ error: err.message || "Failed to process course application" }, { status: 500 });
  }
}
