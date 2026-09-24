// src/app/api/tutor/courses/[courseId]/assignments/route.ts

import { NextResponse } from "next/server";
import { getApiUser, verifyCourseOwnership } from "@/lib/apiAuth";
import { assignmentManagementService } from "../../../../../../lib/services/assignmentManagementService";

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
