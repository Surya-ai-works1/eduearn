// src/app/api/tutor/courses/[courseId]/assignments/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import { assignmentManagementService } from "../../../../../../lib/services/assignmentManagementService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const supabase = await createClient();
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
        { error: "Forbidden: Only tutors can manage assignments" },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const filterStatus = searchParams.get("status") || "all";
    const page = Number(searchParams.get("page") || "1");

    const result = await assignmentManagementService.getAssignments(courseId, search, filterStatus, page);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Failed to load assignments:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load assignments" },
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
        { error: "Forbidden: Only tutors can manage assignments" },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const body = await request.json();

    const assignmentData = {
      title: body.title || "",
      description: body.description || "",
      fileUrl: body.fileUrl || "",
      dueDate: body.dueDate || null,
      status: body.status || "published",
    };

    const newAssignment = await assignmentManagementService.createAssignment(courseId, assignmentData);
    return NextResponse.json(newAssignment);
  } catch (err: any) {
    console.error("Failed to create assignment:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create assignment" },
      { status: 500 }
    );
  }
}
